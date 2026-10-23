export function HubLink(){
 const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 const port=Number(location.port||5193);
 const href=local?'http://127.0.0.1:'+ (5190+port-5193) +'/':'https://vector-digital-demo.rankly-list-0881f9e4.workers.dev/';
 return <><style>{`.vector-brand-wrap{position:relative;display:flex;align-items:center;flex-shrink:0;margin-left:8px}.vector-hub-link{position:absolute;right:calc(100% + 4px);display:grid;place-items:center;width:24px;height:30px;border:1px solid #bed9fa;border-radius:7px;background:#e4efff;color:#236bbc;text-decoration:none;z-index:2}.vector-hub-link:hover{background:#d4ed85}.vector-hub-link:focus-visible{outline:3px solid #3c8fef;outline-offset:2px}@media(max-width:720px){.vector-brand-wrap{margin-left:16px}}`}</style><a className="vector-hub-link" href={href} aria-label="К проектам Вектора" title="К проектам Вектора"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h12"/></svg></a></>;
}
