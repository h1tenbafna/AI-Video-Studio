import json
import zipfile
from pathlib import Path

from tools.graphics.threejs_asset_catalog import CATALOGS, ThreeJSAssetCatalog


def test_catalog_list_is_rights_explicit():
    result = ThreeJSAssetCatalog().execute({"operation": "list"})
    assert result.success
    assert result.data["catalogs"]
    assert all(item["license"] == "CC0-1.0" for item in result.data["catalogs"].values())


def test_catalog_install_inventories_gltf(tmp_path, monkeypatch):
    source_zip = tmp_path / "fixture.zip"
    with zipfile.ZipFile(source_zip, "w") as package:
        package.writestr("Models/GLTF format/Tree.gltf", json.dumps({"asset": {"version": "2.0"}}))
        package.writestr("Models/GLTF format/Tree.bin", b"mesh")
        package.writestr("Textures/tree.png", b"texture")

    fixture_id = "fixture-catalog"
    monkeypatch.setitem(CATALOGS, fixture_id, {
        "title": "Fixture",
        "source_url": "https://example.test/source",
        "download_url": "https://example.test/catalog.zip",
        "license": "CC0-1.0",
        "license_url": "https://creativecommons.org/publicdomain/zero/1.0/",
        "tags": ["fixture"],
    })

    def fake_download(_url: str, destination: Path) -> None:
        destination.write_bytes(source_zip.read_bytes())

    monkeypatch.setattr("tools.graphics.threejs_asset_catalog._download", fake_download)
    output = tmp_path / "installed"
    result = ThreeJSAssetCatalog().execute({
        "operation": "install",
        "catalog_id": fixture_id,
        "output_path": str(output),
    })
    assert result.success, result.error
    assert result.data["model_count"] == 1
    assert result.data["texture_count"] == 1
    assert (output / "catalog-manifest.json").exists()


def _fixture_catalog(monkeypatch, tmp_path, **extra):
    source_zip = tmp_path / "fixture.zip"
    with zipfile.ZipFile(source_zip, "w") as package:
        package.writestr("models/tree.glb", b"glb")
    monkeypatch.setitem(CATALOGS, "fixture-hardening", {
        "title": "Fixture", "source_url": "https://example.test/fixture",
        "download_url": "https://example.test/catalog.zip", "license": "CC0-1.0",
        "license_url": "https://example.test/license", "tags": [], **extra,
    })
    return source_zip


def test_html_download_is_rejected_and_not_kept(tmp_path, monkeypatch):
    """A stale/gated link returns a web page; it must never be stored as the archive."""
    import tools.graphics.threejs_asset_catalog as mod
    _fixture_catalog(monkeypatch, tmp_path)

    class FakeResponse:
        def __init__(self): self._data = iter([b"<!DOCTYPE html><html>gated</html>", b""])
        def read(self, *_a): return next(self._data)
        def __enter__(self): return self
        def __exit__(self, *a): return False

    monkeypatch.setattr(mod.urllib.request, "urlopen", lambda *a, **k: FakeResponse())
    out = tmp_path / "out"
    result = ThreeJSAssetCatalog().execute(
        {"operation": "install", "catalog_id": "fixture-hardening", "output_path": str(out)}
    )
    assert result.success is False
    assert "Continue without donating" in result.error
    assert not (out / "fixture-hardening.zip").exists()
    assert not list(out.glob("*.part"))


def test_invalid_existing_archive_is_not_extracted(tmp_path, monkeypatch):
    _fixture_catalog(monkeypatch, tmp_path)
    out = tmp_path / "out"
    out.mkdir()
    (out / "fixture-hardening.zip").write_bytes(b"<html>not a zip</html>")
    result = ThreeJSAssetCatalog().execute(
        {"operation": "install", "catalog_id": "fixture-hardening", "output_path": str(out)}
    )
    assert result.success is False and "not a valid zip" in result.error
    assert not (out / "source").exists()


def test_pinned_sha256_mismatch_refuses_to_extract(tmp_path, monkeypatch):
    src = _fixture_catalog(monkeypatch, tmp_path)
    out = tmp_path / "out"
    out.mkdir()
    (out / "fixture-hardening.zip").write_bytes(src.read_bytes())
    bad = ThreeJSAssetCatalog().execute({
        "operation": "install", "catalog_id": "fixture-hardening",
        "output_path": str(out), "expected_sha256": "0" * 64,
    })
    assert bad.success is False and "does not match" in bad.error
    assert not (out / "source").exists()
    import hashlib
    good = ThreeJSAssetCatalog().execute({
        "operation": "install", "catalog_id": "fixture-hardening", "output_path": str(out),
        "expected_sha256": hashlib.sha256(src.read_bytes()).hexdigest(),
    })
    assert good.success is True and good.data["sha256_pinned"] is True
