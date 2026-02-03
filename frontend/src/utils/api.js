const IS_VITE_DEV = import.meta.env.DEV || false;
export default class API{
    static HOST = IS_VITE_DEV ? 'http://localhost:3000' : 'https://api.gfic.pro';

    static async __extract_response(resp,errorCb = () => {}){
        if(resp.ok){
            let type = resp.headers.get('content-type');
            try {
                if(type && type.startsWith('text/')){
                    resp = await resp.text();   
                }else if(type && type.startsWith('application/json')){
                    resp = await resp.json();
                }else{
                    resp = await resp.arrayBuffer();
                }
                return resp;
            } catch (error) {
                console.error(error)
                return resp;
            }
        }else{
            try {
                resp = await resp.json();
                errorCb(resp);
                return resp;
            } catch (error) {
                errorCb({error:'Erro ao solicitar.\nVerifique a sua conexao.'});
                return false;
            }
        }
    }
    static async get(endpoint,cbError = () => {}){
        try {
            let busca = await fetch(API.HOST+endpoint,{
                method:'GET',
                credentials:'include',
                mode:'cors'
            });
            return await API.__extract_response(busca,cbError);
        } catch (error) {
            return false;   
        }
    }
    static async delete(endpoint,cbError = () => {}){
        try {
            let busca = await fetch(API.HOST+endpoint,{
                method:'DELETE',
                credentials:'include',
                mode:'cors'
            });
            return await API.__extract_response(busca,cbError);
        } catch (error) {
            return false;   
        }
    }
    static async post(endpoint,data,cbError = () => {}){
        try {
            let busca = await fetch(API.HOST+endpoint,{
                method:'POST',
                credentials:'include',
                mode:'cors',
                headers:{
                    'content-type':'application/json'
                },
                body:JSON.stringify(data)
            });
            return await API.__extract_response(busca,cbError);
        } catch (error) {
            return false;   
        }
    }
    static async put(endpoint,data,cbError = () => {}){
        try {
            let busca = await fetch(API.HOST+endpoint,{
                method:'PUT',
                credentials:'include',
                mode:'cors',
                headers:{
                    'content-type':'application/json'
                },
                body:JSON.stringify(data)
            });
            return await API.__extract_response(busca,cbError);
        } catch (error) {
            return false;   
        }
    }
    static async upload(endpoint,formData,cbError = () => {}){
        try {
            let busca = await fetch(API.HOST+endpoint,{
                method:'POST',
                credentials:'include',
                mode:'cors',
                body: formData
            });
            return await API.__extract_response(busca,cbError);
        } catch (error) {
            return false;   
        }
    }
    static async getHomeList(region='', page=1, type=''){
        const params = new URLSearchParams()
        if (region) params.append('region', region)
        if (page) params.append('page', page)
        if (type) params.append('type', type)
        const query = params.toString() ? `?${params.toString()}` : ''
        return await API.get(`/assets${query}`);
    }
    static async getConfigs(){
        let results = await API.get(`/app/configs`);
        return results;
    }
}
