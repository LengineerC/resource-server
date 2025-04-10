import FTPHandler from "../src/server/components/FTPHandler";
import {expect, test} from '@jest/globals';
import * as fs from 'fs';
import path from "path";
import process from "process";

const ftp=new FTPHandler({
    "host": "192.168.10.1",
    "port": 21,
    "user": "lengineerc",
    "pass": "9090980Ab"
});

async function main() {
    await ftp.connect();
    const res=await ftp.ls("./lengineerc/courses/db/exam/大题解题方法.pdf");
    console.log(res);
    // const socket=await ftp.get("./lengineerc/courses/db/exam/大题解题方法.pdf");
    // const stream=fs.createWriteStream(path.resolve(process.cwd(),"./__test__/download/大题解题方法.pdf"));
    // socket.pipe(stream);

    await ftp.quit();
}


test("ftp",async()=>{
    await main();
    expect(1).toBe(1);
},30000);