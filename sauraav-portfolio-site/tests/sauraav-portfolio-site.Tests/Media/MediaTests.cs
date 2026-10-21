using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using sauraav_portfolio_site.Services.Media;

namespace sauraav_portfolio_site.Tests.Media;

public sealed class MediaTests : IDisposable
{
    private readonly string _webRoot = Path.Combine(Path.GetTempPath(), "portfolio-tests", Guid.NewGuid().ToString("N"));
    private readonly LocalMediaStorage _storage;

    public MediaTests()
    {
        Directory.CreateDirectory(_webRoot);
        _storage = new LocalMediaStorage(new FakeWebHostEnvironment(_webRoot));
    }

    public void Dispose()
    {
        if (Directory.Exists(_webRoot))
        {
            Directory.Delete(_webRoot, recursive: true);
        }
    }

    [Fact]
    public void DetectExtension_recognises_mp4_and_webm_signatures()
    {
        Assert.Equal(".mp4", VideoUploadPolicy.DetectExtension([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32]));
        Assert.Equal(".webm", VideoUploadPolicy.DetectExtension([0x1A, 0x45, 0xDF, 0xA3, 0, 0, 0, 0]));
        Assert.Null(VideoUploadPolicy.DetectExtension("<html><script>"u8));
        Assert.Null(VideoUploadPolicy.DetectExtension(ReadOnlySpan<byte>.Empty));
    }

    [Fact]
    public async Task SaveVideoAsync_stores_a_real_mp4_under_a_generated_name()
    {
        var bytes = Mp4Bytes();
        var result = await _storage.SaveVideoAsync(FormFile(bytes, "../../evil.mp4", "video/mp4"));

        Assert.True(result.Succeeded, result.Error);
        Assert.Matches(@"^/videos/[0-9a-f]{32}\.mp4$", result.Path);

        var stored = Path.Combine(_webRoot, "videos", Path.GetFileName(result.Path!));
        Assert.Equal(bytes, await File.ReadAllBytesAsync(stored));
    }

    [Fact]
    public async Task SaveVideoAsync_rejects_files_that_only_claim_to_be_video()
    {
        var html = Encoding.ASCII.GetBytes("<html><script>alert(1)</script></html>");
        var result = await _storage.SaveVideoAsync(FormFile(html, "page.mp4", "video/mp4"));

        Assert.False(result.Succeeded);
        var folder = Path.Combine(_webRoot, "videos");
        Assert.Empty(Directory.Exists(folder) ? Directory.GetFiles(folder) : Array.Empty<string>());
    }

    [Fact]
    public async Task SaveVideoAsync_rejects_wrong_content_type_and_empty_files()
    {
        Assert.False((await _storage.SaveVideoAsync(FormFile(Mp4Bytes(), "a.mp4", "application/octet-stream"))).Succeeded);
        Assert.False((await _storage.SaveVideoAsync(FormFile([], "a.mp4", "video/mp4"))).Succeeded);
    }

    [Fact]
    public async Task DeleteAsync_only_removes_paths_it_issued()
    {
        var saved = await _storage.SaveVideoAsync(FormFile(Mp4Bytes(), "a.mp4", "video/mp4"));
        var stored = Path.Combine(_webRoot, "videos", Path.GetFileName(saved.Path!));
        var bystander = Path.Combine(_webRoot, "videos", "keep.txt");
        await File.WriteAllTextAsync(bystander, "x");

        await _storage.DeleteAsync("/videos/keep.txt");
        await _storage.DeleteAsync("/videos/../web.config");
        Assert.True(File.Exists(bystander));

        await _storage.DeleteAsync(saved.Path!);
        Assert.False(File.Exists(stored));
    }

    private static byte[] Mp4Bytes()
    {
        var header = new byte[] { 0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D };
        var body = Enumerable.Range(0, 64).Select(i => (byte)i).ToArray();
        return [.. header, .. body];
    }

    private static IFormFile FormFile(byte[] bytes, string fileName, string contentType)
    {
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, bytes.Length, "video", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType,
        };
    }

    private sealed class FakeWebHostEnvironment(string webRoot) : IWebHostEnvironment
    {
        public string WebRootPath { get; set; } = webRoot;
        public Microsoft.Extensions.FileProviders.IFileProvider WebRootFileProvider { get; set; } = new Microsoft.Extensions.FileProviders.NullFileProvider();
        public string ApplicationName { get; set; } = "tests";
        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } = new Microsoft.Extensions.FileProviders.NullFileProvider();
        public string ContentRootPath { get; set; } = webRoot;
        public string EnvironmentName { get; set; } = "Development";
    }
}
