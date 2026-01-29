import fs from 'fs';
async function main(){
    let js = fs.readFileSync('exclude.json','utf-8');
    if(js){
        js = JSON.parse(js);
        js.map((item)=>{
            let file = `assets/logos/${item.item}.svg`;
            if(fs.existsSync(file)){
                fs.unlinkSync(file);
            }
        })
    }
}
main();