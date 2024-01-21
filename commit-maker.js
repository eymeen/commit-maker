import fs from "fs";
import moment from "moment";
import { execSync } from "child_process"
import _ from "lodash"


export default class CommitMaker{
    constructor(){
        this.dir_name = "fake_commits"
    }

    /**
     *
     * @param {object} data {start, finish, max, min}
     * @return {object} date:quantity
     */
    random(data = null){
        let {start, finish, max, min} = data;

        let startDate = moment(start, "YYYY-MM-DD");
        let endDate = moment(finish, "YYYY-MM-DD");
        let object = {};

        while(startDate.isBefore(endDate)){
            object[startDate.valueOf()] = this.getRandom(min, max);

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
        let extra = date ? `--date=\"${date}\" --amend --no-edit` : "";
        execSync(`git add ${files}`);
        execSync(`git commit -m \"${msg}\" ` + extra);
    }
    execUndoCommit(){
        execSync(`git reset --hard HEAD~1`);
    }
    execPush(){
        let total = _.sum(Object.values(this.object))
        this.askQuestion(`Do you want to push ${total} commits?`)
            .then((answer) => {
                if (answer.answer) {
                    execSync(`git push`);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    start(){
        this.setup()
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
        try {
            let folder = date.replaceAll(":","")
            let formatted_date = moment.unix(date/1000).format("YYYY-MM-DDTHH:mm:ss")

            if(!fs.existsSync(folder)){
                fs.mkdirSync(folder);
            }
            process.chdir(folder);
            for(let i = 1; i <= quantity;i++){
                fs.writeFileSync(`${folder}_${i}`, '')

                this.execCommit(`${date} n#${i}`, formatted_date, `${folder}_${i}`)
            }

            process.chdir('..');
        } catch (error) {
            throw Error(error)
        }
    }


    askQuestion(question) {
        const prompt = {
          type: 'confirm',
          name: 'answer',
          message: question
        };

        return inquirer.prompt(prompt);
    }

    getRandom(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
