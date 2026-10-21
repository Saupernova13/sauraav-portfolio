using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Firebase;

namespace sauraav_portfolio_site.Tests.Firebase;

public sealed class InMemoryFirebaseServiceTests
{
    [Fact]
    public async Task Parent_node_returns_its_children_as_a_dictionary()
    {
        var store = new InMemoryFirebaseService();
        await store.SetData("skills/C#", new SkillsModel { SkillName = "C#", SkillLevel = 9 });
        await store.SetData("skills/SQL", new SkillsModel { SkillName = "SQL", SkillLevel = 7 });

        var all = await store.GetData<Dictionary<string, SkillsModel>>("skills");

        Assert.NotNull(all);
        Assert.Equal(2, all.Count);
        Assert.Equal(9, all["C#"].SkillLevel);
    }

    [Fact]
    public async Task Missing_nodes_return_null_and_delete_removes_subtrees()
    {
        var store = new InMemoryFirebaseService();
        Assert.Null(await store.GetData<SummaryModel>("summary"));

        await store.SetData("education/A", new EducationModel { SchoolName = "A" });
        await store.DeleteData("education");

        Assert.Null(await store.GetData<Dictionary<string, EducationModel>>("education"));
    }
}
