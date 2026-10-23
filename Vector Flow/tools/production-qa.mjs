import { spawn } from 'node:child_process';
import { preview } from 'vite';
const run=(args,env={})=>new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,...env}});
  child.on('error',reject);
  child.on('exit',code=>code===0?resolve():reject(new Error(`Command failed (${code}): ${args.join(' ')}`)));
});
await run(['node_modules/typescript/bin/tsc','--noEmit']);
await run(['node_modules/vite/bin/vite.js','build']);
const server=await preview({preview:{host:'127.0.0.1',port:5199,strictPort:true,open:false}});
try{
  await run(['node_modules/@playwright/test/cli.js','test'],{PLAYWRIGHT_BASE_URL:'http://127.0.0.1:5199'});
}finally{
  await new Promise(resolve=>{server.httpServer.close(resolve);server.httpServer.closeAllConnections();});
}
