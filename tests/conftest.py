"""Session-wide test safety net.

**No test may open a network connection.** Provider tools bill per call, so a
test that reaches a real endpoint costs the developer money — silently, and
every time CI runs. This blocks outbound sockets for the whole test session.

The guard is at the socket layer on purpose. Patching `requests` only covers
tools that use `requests`; the fleet also talks to vendor SDKs (google-cloud,
openai, boto3), `httpx`, and raw `urllib`. Everything bottoms out in
`socket.connect`, so that is where the wall goes.

Loopback is still allowed — local servers, ffmpeg RPC, and Backlot fixtures need it.

To write a test that genuinely hits a live API:

    @pytest.mark.live_api
    def test_real_call():
        ...

Marked tests are **skipped by default** and only run with the env flag set:

    OPENMONTAGE_ALLOW_NETWORK=1 pytest -m live_api

Limitation: this guards the pytest process. A test that shells out to a
subprocess (node, ffmpeg, npx) is outside its reach — don't call paid APIs
from a subprocess in tests.
"""

from __future__ import annotations

import os
import socket

import pytest

_ALLOW_ENV_FLAG = "OPENMONTAGE_ALLOW_NETWORK"

_LOOPBACK_HOSTS = {"localhost", "127.0.0.1", "::1", "0.0.0.0", ""}

_real_connect = socket.socket.connect
_real_connect_ex = socket.socket.connect_ex
_real_create_connection = socket.create_connection


class NetworkCallInTestError(RuntimeError):
    """Raised when a test tries to open a non-loopback connection."""


def _network_allowed() -> bool:
    return os.environ.get(_ALLOW_ENV_FLAG, "").strip().lower() in {"1", "true", "yes"}


def _is_loopback(address) -> bool:
    """True for loopback TCP/UDP targets and for AF_UNIX socket paths."""
    if isinstance(address, (str, bytes)):
        return True  # AF_UNIX / abstract socket — local by definition
    if not isinstance(address, (tuple, list)) or not address:
        return True  # unrecognised shape; let the real call decide
    host = address[0]
    if isinstance(host, bytes):
        host = host.decode("utf-8", "replace")
    if not isinstance(host, str):
        return False
    host = host.strip("[]").lower()
    if host in _LOOPBACK_HOSTS:
        return True
    return host.startswith("127.")


def _blocked(address) -> NetworkCallInTestError:
    return NetworkCallInTestError(
        f"Blocked a network connection to {address!r} during a test.\n"
        f"\n"
        f"Tests must not call real endpoints — provider APIs bill per request.\n"
        f"Mock the transport instead (see tests/tools/test_atlas_video.py for the\n"
        f"fake-`requests` pattern), or mark the test @pytest.mark.live_api and run\n"
        f"it deliberately with {_ALLOW_ENV_FLAG}=1."
    )


@pytest.fixture(scope="session", autouse=True)
def _block_network():
    """Refuse non-loopback sockets for the entire session."""
    if _network_allowed():
        yield
        return

    def guarded_connect(self, address, *args, **kwargs):
        if not _is_loopback(address):
            raise _blocked(address)
        return _real_connect(self, address, *args, **kwargs)

    def guarded_connect_ex(self, address, *args, **kwargs):
        if not _is_loopback(address):
            raise _blocked(address)
        return _real_connect_ex(self, address, *args, **kwargs)

    def guarded_create_connection(address, *args, **kwargs):
        if not _is_loopback(address):
            raise _blocked(address)
        return _real_create_connection(address, *args, **kwargs)

    socket.socket.connect = guarded_connect
    socket.socket.connect_ex = guarded_connect_ex
    socket.create_connection = guarded_create_connection
    try:
        yield
    finally:
        socket.socket.connect = _real_connect
        socket.socket.connect_ex = _real_connect_ex
        socket.create_connection = _real_create_connection


# Legacy test modules that run paid-provider tools against mocked transports.
# The local-only spend policy blocks those tools by design, so ONLY these modules
# get the policy switched off. Every other test (including all of
# tests/tools/test_spend_policy.py) runs against the real policy.
# Derived 2026-11-19 from a full run under the real policy: each module below
# passes with the policy off and fails only because it drives a paid/hybrid
# tool (mocked transport). Add a module only if it needs a mocked paid provider.
_PAID_PROVIDER_MOCK_MODULES: frozenset[str] = frozenset({
    "test_3d_asset_generation",
    "test_atlas_tools",
    "test_atlas_video",
    "test_azure_stt",
    "test_azure_tts",
    "test_base_tool_cache",
    "test_corpus_builder_path_traversal",
    "test_corpus_builder_total_failure",
    "test_dashscope_tools",
    "test_documentary_governance",
    "test_elevenlabs_timestamps",
    "test_fal_elevenlabs_music",
    "test_fal_elevenlabs_tts",
    "test_fal_resume_output_format",
    "test_fish_audio_tts",
    "test_freesound_music",
    "test_gemini_omni_video",
    "test_google_imagen_gemini_backend",
    "test_google_imagen_multi_output",
    "test_google_tts_scoped_key",
    "test_google_tts_voice_id_alias",
    "test_google_vertex_backends",
    "test_hunyuan_cloud_video",
    "test_hunyuan_image",
    "test_image_selector_hooks",
    "test_inworld_tts",
    "test_jimeng_video",
    "test_kling_o3_fal_video",
    "test_kling_official_avatar",
    "test_kling_official_image",
    "test_kling_official_video",
    "test_kling_tts",
    "test_minicut_media",
    "test_minicut_sfx",
    "test_minicut_upscale",
    "test_minimax_image",
    "test_minimax_video",
    "test_new_video_model_support",
    "test_openai_image_multi_output",
    "test_phase3_contracts",
    "test_pika_video",
    "test_pixabay_music_retry",
    "test_pixabay_per_page_clamp",
    "test_provider_oct23",
    "test_provider_refresh",
    "test_schema_media_native_references",
    "test_seedance_ark_video",
    "test_seedream_image",
    "test_sora_video",
    "test_stock_provider_detection",
})


@pytest.fixture(autouse=True)
def _spend_policy_for_tests(request):
    from lib import spend_policy

    module = request.module.__name__.rsplit(".", 1)[-1]
    if module in _PAID_PROVIDER_MOCK_MODULES:
        spend_policy.set_policy_override(spend_policy.SpendPolicy(mode="off"))
    else:
        spend_policy.set_policy_override(None)
        spend_policy.reset_policy()
    try:
        yield
    finally:
        spend_policy.set_policy_override(None)
        spend_policy.reset_policy()


def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "live_api: test performs a real, billable API call. Skipped unless "
        f"{_ALLOW_ENV_FLAG}=1 is set.",
    )


def pytest_collection_modifyitems(config, items):
    """Skip live_api tests unless the operator explicitly opted in."""
    if _network_allowed():
        return
    skip = pytest.mark.skip(
        reason=f"live API test — costs money; set {_ALLOW_ENV_FLAG}=1 to run"
    )
    for item in items:
        if "live_api" in item.keywords:
            item.add_marker(skip)
