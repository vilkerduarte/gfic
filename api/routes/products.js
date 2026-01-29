import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticateToken } from '../middleware/authentication.js';
import Admin from '../lib/manager.js';
import fs from 'fs'

const router = Router()
router.get('/', async (req, res) => {
    let products = await prisma.learn_products.findMany();

    res.status(200).json(products);
})
router.use(authenticateToken);
router.get('/my', async (req, res) => {
    let products = await prisma.my_learn_products.findMany({ where: { user_id: req.user.id } });

    res.status(200).json(products);
})
router.post('/buy', async (req, res) => {
    let { hash } = req.body;
    if (!hash) {
        return res.status(400).json({ error: "Requisição Inválida!" });
    }
    
    let product = await prisma.learn_products.findFirst({ where: { hash } });
    if(product){
        let {id,price} = product;
        if(price > req.user.balance){
            return res.status(402).json({error:"Saldo Insuficiente"})
        }
        if(await Admin.removeCredits(req.user,price,'Compra de Produto Educativo')){
            await prisma.my_learn_products.create({
                data:{
                    product_id:id,
                    created_at:new Date(),
                    user_id:req.user.id
                }
            });

            return res.status(200).json(product);
        }else{
            return res.status(402).json({error:"Créditos Insuficiente"})
        }

    }
    return res.status(400).json({ error: "Requisição Inválida!" });
})
router.get('/download/:filename', async (req, res) => {
    let { filename } = req.params;
    function invalid(){
        return res.status(400).json({ error: "Requisição Inválida!" });
    }
    if (!filename) {
        return invalid();
    }
    let path = `products/${filename}`;
    if(!fs.existsSync(path)){
        return res.status(400).json({ error: "Requisição Inválida!" });
    }
    let hash = filename.split('.')[0];
    
    let product = await prisma.my_learn_products.findFirst({ where: {
        user_id:req.user.id,
        my_learn_products:{
            hash
        }
    },include:{my_learn_products:true} });
    if(product){
        let {title,type} = product.my_learn_products;
        res.set({'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${title}.pdf"`});
        return res.status(200).send(fs.readFileSync(path));
    }else{
        return invalid()
    }
})

export default router