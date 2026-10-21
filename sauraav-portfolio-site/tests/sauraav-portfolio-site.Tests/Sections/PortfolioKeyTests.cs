using sauraav_portfolio_site.Services.Sections;

namespace sauraav_portfolio_site.Tests.Sections;

public sealed class PortfolioKeyTests
{
    [Theory]
    [InlineData("University of Cape Town", "University of Cape Town")]
    [InlineData("  padded  ", "padded")]
    [InlineData("C#/.NET [core] $5 #1", "C___NET _core_ _5 _1")]
    public void TryCreate_sanitises_invalid_characters(string name, string expected)
    {
        Assert.True(PortfolioKey.TryCreate(name, out var key));
        Assert.Equal(expected, key);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void TryCreate_rejects_blank_names_so_a_section_node_is_never_addressed(string? name)
    {
        Assert.False(PortfolioKey.TryCreate(name, out var key));
        Assert.Equal(string.Empty, key);
    }

    [Fact]
    public void TryCreate_rejects_names_over_the_limit()
    {
        Assert.False(PortfolioKey.TryCreate(new string('a', PortfolioKey.MaxLength + 1), out _));
    }

    [Theory]
    [InlineData("plain key", true)]
    [InlineData("with/slash", false)]
    [InlineData("with.dot", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IsValid_only_accepts_keys_this_class_could_produce(string? key, bool expected)
    {
        Assert.Equal(expected, PortfolioKey.IsValid(key));
    }

    [Fact]
    public void Create_throws_for_unusable_names()
    {
        Assert.Throws<ArgumentException>(() => PortfolioKey.Create(" "));
    }
}
