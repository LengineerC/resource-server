import FTPHandler from "../src/server/components/FTPHandler";
import {expect, test} from '@jest/globals';

const ftp=new FTPHandler({
    "host": "192.168.10.1",
    "port": 21,
    "user": "lengineerc",
    "pass": "9090980Ab"
});

async function main() {
    await ftp.connect();
    const res=await ftp.ls('/CR');
    console.log(res);

    await ftp.quit();
}


test("ftp",async()=>{
    await main();
    expect(1).toBe(1);
});