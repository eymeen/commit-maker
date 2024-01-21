import CommitMaker from "./commit-maker.js";

const commit = new CommitMaker()

commit.random({
    start: "2016-01-01",
    finish: "2016-12-31",
    max: 10,
    min: 0,
})
commit.start()
// commit.cleanup()
