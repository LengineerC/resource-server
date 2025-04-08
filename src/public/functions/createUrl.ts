export default function createUrl(baseurl:string,...paths:string[]){
    let url="";
    let urlArr:string[]=[baseurl,...paths];
    const formatedUrlArr=urlArr.map(url=>url.replace(/\//g,""));
    url="/"+formatedUrlArr.join('/');
    
    return url;
}