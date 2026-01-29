import prisma from "./prisma.js";

export default class Admin {
    static async updateCredits(user, value, description) {
        console.log(user,value,description);
        let credit = await prisma.credits.create({
            data: {
                user_id: user.id,
                value,
                description,
                balance: user.balance + value,
                expires_at: new Date(Date.now() + (3600 * 24 * 31 * 1000)),
            }
        })
        if(credit){
            await prisma.user.update({
                data:{
                    balance:credit.balance
                },
                where:{
                    id:user.id
                }
            });
            return credit;
        }else{
            return false;
        }
    }
    static async addCredits(user,value,description){
        return await Admin.updateCredits(user,value,description);
    }
    static async removeCredits(user,value,description){
        return await Admin.updateCredits(user,value >= 0 ? -value : value,description);
    }
    static async getConfig(config){
        let result = await prisma.config.findFirst({where:{config}});
        return result ? result.value : null;
    }
    static async setConfig(config,value){
        let result = await prisma.config.findFirst({where:{config}});
        try {
            if(result){
                await prisma.config.update({where:{id:result.id},data:{value}});
            }else{
                await prisma.config.create({data:{value,config}});
            }
            return true;
        } catch (error) {
            return false;
        }
    }
}
