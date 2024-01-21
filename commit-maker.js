import fs from "fs";
import moment from "moment";

export default class CommitMaker{
    constructor(){
        this.dir_name = "fake_commits"
    }

    /**
     *
     * @param {object} data {start, finish, max, blanks}
     * @return {object} date:quantity
     */
    random(data = null){
        let {start, finish, max, blanks} = data;

        let startDate = new moment(start);
        let endDate = new moment(finish);
        let object = {};

        while(startDate.isBefore(endDate)){
            let formatted = startDate.valueOf();
            object[formatted] = this.getRandom(+blanks, max);
            startDate = startDate.add(1, 'day')
        }

        this.object = object;
    }

    setup(){
        if(!fs.existsSync(this.dir_name)){
            fs.mkdirSync(this.dir_name);
        }
    }
    cleanup(){
        if(fs.existsSync(this.dir_name)){
            execSync("rmdir /s /q "+this.dir_name)
        }
        this.execCommit("Cleaning Up")
        this.execPush()
    }

    execCommit(msg, date = null, files = "-A"){
        // let extra = date ? `--date=\"${date}\" --amend --no-edit` : "";
        execSync(`git add ${files}`);
        execSync(`git commit -m "${msg}"`);
        if(date) execSync(`--date=\"${date}\" --amend --no-edit`);
    }
    execPush(){
        execSync(`git push`);
    }


    start(){
        let commits = this.object;

        process.chdir(this.dir_name);
        console.log("Started Committing...")
        for(let commit in commits){
            this.commit(commits[commit], commit)
        }
        process.chdir('..');

        this.execPush();
        console.log("Commits Finished!")

        return 0;
    }

    commit(quantity, date){
        // bugable
        let folder = String(date)
        let formatted_date = new moment(date);
        formatted_date = formatted_date.format('YYYY-MM-DDTHH:mm:ss')

        if(!fs.existsSync(folder)){
            fs.mkdirSync(folder);
        }
        process.chdir(folder);
        for(let i = 1; i <= quantity;i++){
            fs.writeFileSync(`${timestamp}_${i}`, '')

            this.execCommit(`${date} n#${i}`, formatted_date, `${folder}_${i}`)
        }

        process.chdir('..');
    }

    // arithmetic

    getRandom(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    // date
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

}

/*
random commits between two dates, with the old settings ( max min...).
ability to do on code AND on cmd

add the ability to accept commit array, which is a matrix of the year table (preparing for the upcoming updates)
then add, from start to end:
flags
text
images


then make online editor that export data,


*/
