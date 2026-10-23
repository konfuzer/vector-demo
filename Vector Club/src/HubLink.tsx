export function HubLink(){
 const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 const port=Number(location.port||5195);
 const href=local?'http://127.0.0.1:'+ (5190+port-5195) +'/':'https://vector-digital-demo.rankly-list-0881f9e4.workers.dev/';
 return <><style>{`.vector-brand-wrap{position:relative;display:flex;align-items:center;flex-shrink:0;margin-left:32px}.vector-hub-link{position:absolute;right:calc(100% + 12px);display:grid;place-items:center;width:28px;height:28px;border:1px solid #bed9fa;border-radius:50%;background:transparent;color:#236bbc;text-decoration:none;z-index:2;transition:background-color .16s,border-color .16s}.vector-hub-link:hover{background:#e4efff;border-color:#88baf3}.vector-hub-link:focus-visible{outline:3px solid #3c8fef;outline-offset:2px}@media(max-width:720px){.vector-brand-wrap{margin-left:32px}}`}</style><a className="vector-hub-link" href={href} aria-label="К проектам Вектора" title="К проектам Вектора"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h12"/></svg></a></>;
}
