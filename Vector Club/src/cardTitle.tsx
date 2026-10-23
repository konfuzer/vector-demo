import type {Program} from './domain';
export function cardTitle(program:Program){
 if(program.cardHeading)return program.cardHeading.split('\n').map((line,i)=><span key={i}>{i>0&&<br/>}{line}</span>);
 if(program.id==='design')return <>Дизайн<br/>и анимация</>;
 if(program.id==='science')return <>Научная<br/>мастерская</>;
 return program.name;
}
