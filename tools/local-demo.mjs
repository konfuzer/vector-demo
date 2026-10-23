import http from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream} from 'node:fs';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const projects=[['club','Vector Club',5195],['flow','Vector Flow',5193],['universe','Vector Universe/app',5187]];
const action=process.argv[2]||'start';
if(['setup','build'].includes(action)){
 for(const [key,folder] of projects){
  console.log(`\n${key}: ${action==='setup'?'npm ci':'npm run build'}`);
  const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',action==='setup'?['ci']:['run','build'],{cwd:resolve(root,folder),stdio:'inherit',shell:process.platform==='win32'});
  if(result.status!==0)process.exit(result.status||1);
 }
 process.exit(0);
}
if(action!=='start')throw Error('Use setup, build or start');
const offset=Number(process.env.VECTOR_PORT_OFFSET||0);
if(!Number.isInteger(offset)||offset<0||offset>50000)throw Error('Invalid VECTOR_PORT_OFFSET');
const urls=Object.fromEntries(projects.map(([key,,port])=>[key,`http://127.0.0.1:${port+offset}/`]));
const roots=projects.map(([key,folder,port])=>({key,folder:resolve(root,folder,'dist'),port:port+offset}));
roots.push({key:'hub',folder:resolve(root,'Demo Hub'),port:5190+offset});
for(const site of roots)if(!existsSync(resolve(site.folder,'index.html')))throw Error(`Missing build: ${site.folder}. Run npm run build first.`);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.ttf':'font/ttf','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm','.ico':'image/x-icon'};
const servers=[];
try{
 for(const site of roots){
  const server=http.createServer((req,res)=>{
   try{
    let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/')pathname='/index.html';
    const file=resolve(site.folder,'.'+pathname);
    if(!file.startsWith(site.folder+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end('Not found');return}
    res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
    if(site.key==='hub'&&pathname==='/index.html'){
     let html=readFileSync(file,'utf8');for(const [key,url]of Object.entries(urls))html=html.replaceAll(`https://vector-${key}-demo.rankly-list-0881f9e4.workers.dev/`,url);
     res.end(html);return;
    }
    const size=statSync(file).size;
    const match=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(match){const start=Number(match[1]),end=Math.min(match[2]?Number(match[2]):size-1,size-1);if(start>end){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return}res.writeHead(206,{'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});createReadStream(file,{start,end}).pipe(res);}
    else{res.writeHead(200,{'Accept-Ranges':'bytes','Content-Length':size});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);}
   }catch{res.writeHead(400);res.end('Bad request')}
  });
  servers.push(server);
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(site.port,'127.0.0.1',ok)});
 }
 console.log(`\nVECTOR DEMO: http://127.0.0.1:${5190+offset}/\nThree local production builds. Internet is not required after setup/build.\nCtrl+C stops these servers.`);
}catch(error){for(const server of servers)server.close();console.error(error.message);process.exitCode=1}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{for(const server of servers)server.close();process.exit(0)});
