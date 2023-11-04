const { execSync } = require('child_process');
const readline = require('readline-sync');
const fs = require("fs");

class Commit{
    /**
     * TODO:
     * types: Drawing, Flag, text;
     * text types: normal, with shadow, with background
     * DONE:
     * in-range random
     */
    constructor(start, end, blanks, max, type="random"){
        this.startDate = this.getTime(start);
        this.endDate = this.getTime(end);
        this.blanks = blanks;
        this.max = max;
        this.type = type;
    }
    start(){
        for (let i = this.startDate; i <= this.endDate ; i += 60 * 60 * 24){
            if(this.commit(i, this.getRandom([+!this.blanks, 4]) ,this.max)) console.log("done");
        }
    }
    commit(timestamp, level, max=4){
        if(level==0) return 0;

        if(!fs.existsSync("fake_commits")){
            fs.mkdirSync("fake_commits");
        }
        process.chdir("fake_commits")

        if(!fs.existsSync(timestamp.toString())){
            fs.mkdirSync(timestamp.toString());
        }

        process.chdir(timestamp.toString());

        let commit_frequency = this.getRandom(this.range(level, max));
        for(let i = 1; i <= commit_frequency;i++){
            let date = new Date(timestamp * 1000);
            console.log(date ,timestamp )
            fs.writeFileSync(`${timestamp}_${i}`, '')
            execSync(`git add "${timestamp}_${i}"`);
            execSync(`git commit -m "Commit" --date=\"${date}\" --amend --no-edit`)
        }

        process.chdir('../..');
        return true
    }
    singleCommit(timestamp){
        if(level==0) return 0;

        if(!fs.existsSync("fake_commits")){
            fs.mkdirSync("fake_commits");
        }
        process.chdir("fake_commits")

        if(!fs.existsSync(timestamp.toString())){
            fs.mkdirSync(timestamp.toString());
        }

        process.chdir(timestamp.toString());

        let date = new Date(timestamp * 1000);
        console.log(date ,timestamp )
        fs.writeFileSync(`${timestamp}`, '')
        execSync(`git add "${timestamp}"`);
        execSync(`git commit -m "Commit" --date=\"${date}\" --amend --no-edit`)

        process.chdir('../..');

        return true;
    }

    push(){
        execSync(`git push`);

        return true
    }
    make(cleanUp = true){
        this.start()
        this.push()
        if(cleanUp) this.cleanUp();

        return true
    }
    cleanUp(cancel_commits = false){
        fs.rmSync("fake_commits")
        if(cancel_commits) this.cancelCommits();
        execSync(`git add -A`);
        execSync(`git commit -m "Clean Up!"`);
        this.push();

        return true
    }
    cancelCommits(){
        execSync("git reset --hard $(git rev-list --max-parents=0 HEAD)");
        return 0;
    }

    // range
    range(level, max){
        if(level == 4) {
            return [(max*.75)+1, max];
        }
        let range = ((level/4)*max);
        return [~~range, -~range];
    }
    getRandom([min, max]){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    getTime(dateString) {
        const parts = dateString.split('-');
        if (parts.length !== 3) {
          return null;
        }

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        const timestamp = Date.UTC(year, month, day) / 1000;

        return timestamp;
    }
    generateMatrix(year = -1) {
        const full = Array(7).fill().map(() => Array(53).fill(0));

        if (year === -1) return full;

        const startDay = new Date(year, 0, 1).getDay();
        const endDay = new Date(year, 11, 31).getDay();

        for (let i = 0; i < startDay; i++) {
            full[i][0] = -1;
        }

        for (let i = 6; i > endDay; i--) {
            full[i][52] = -1;
        }

        return full;
    }
    findDay(matrix, year, month, day, index = false){ // return value or the index
        let r = new Date(year, month, day).getDay()

        const jan1 = new Date(year, 0, 1).getDay();
        const tilSunday = (jan1 + 1) % 7;
        const targetDate = new Date(year, month, day);
        const startDate = new Date(year, 0, 1);
        const timeDiff = targetDate - startDate;
        const dayOrder = Math.floor(timeDiff / (24 * 60 * 60 * 1000));

        let c = (tilSunday + dayOrder)/7
        return index ? [r,~~c] : matrix[r][~~c];
    }
    set(matrix, type, value, index){
        switch (type) {
            case "single":
                let k = findDay(matrix, index.split('-'), true)
                matrix[k[0]][k[1]] = value;
                break;
            case "row":
                matrix[index] = matrix[index].map(e=>e==-1?e:value);
                break;
            case "col":
                for(let i = 0; i < 7 ; i++){
                    matrix[i][index] = value
                }
                break;
        }

        return matrix;
    }

    matrixToArray(matrix, year) {
        const result = {};

        for (let row = 0; row < 7; row++) {
          for (let col = 0; col < 53; col++) {
            const value = matrix[row][col];
            if (value >= 1) {
              const date = new Date();
              date.setFullYear(year);
              date.setMonth(0);
              date.setDate(1 + (col * 7) - date.getDay() + row);

              let timestamp = date.getTime()
              result[timestamp] = [date, value];
            }
          }
        }

        return result;
    }
}

const commit = new Commit("10-10-2020", "10-10-2021", true, 16)
commit.start()
// commit.push()
// commit.cleanUp()
