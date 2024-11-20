const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const config = require('../config');
const Product = require('./model');
const Category = require('../category/model')
const Tags = require('../tag/model')

// Fungsi untuk memastikan direktori tujuan ada
const ensureDirectoryExistence = (filePath) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const store = async (req, res, next) => {
    try {
        let payload = req.body;

        if(payload.category){
            let category = await Category.findOne({name: {$regex: payload.category, $options: 'i'}});
        if(category){
            payload ={...payload, category: category._id}
        }else {
            delete payload.category;
            }
        }

        if(payload.tag && payload.length > 0){
            let tag = await Tags.findOne({name: {$in: payload.tag}});
        if(tag){
            payload ={...payload, tag: tag.map(tag = tag._id)}
        }else {
            delete payload.tag;
            }
        }
        
        if (req.file && req.file.originalname) {
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.join(config.rootPath, `public/images/products/${filename}`);

            ensureDirectoryExistence(target_path);

            if (!fs.existsSync(tmp_path)) {
                console.error("File sementara tidak ditemukan:", tmp_path);
                return res.status(500).json({ error: "File sementara tidak ditemukan sebelum proses copy." });
            }

            try {
                await fsPromises.copyFile(tmp_path, target_path);
                await fsPromises.unlink(tmp_path);

                if (fs.existsSync(target_path)) {
                    console.log("File tersimpan di:", target_path);
                } else {
                    console.error("File tidak ditemukan di:", target_path);
                    return res.status(500).json({ error: "File tidak ditemukan di lokasi tujuan setelah proses copy." });
                }

                // Simpan informasi produk ke database
                let product = new Product({ ...payload, image_url: filename });
                await product.save();
                
                return res.json(product);
            } catch (err) {
                console.error("Error saat menyalin file atau menyimpan produk:", err);
                
                if (fs.existsSync(target_path)) {
                    fs.unlinkSync(target_path);
                }

                if (err && err.name === 'ValidationError') {
                    return res.status(400).json({
                        error: 1,
                        message: err.message,
                        fields: err.errors
                    });
                }
                
                next(err);
            }

        } else {
            let product = new Product(payload);
            await product.save();
            return res.json(product);
        }
    } catch (err) {
        next(err); 
    }
};

const update = async (req, res, next) => {
    try {
        let payload = req.body;
        let id = req.params.id;

        if(payload.category){
            let category = await Category.findOne({name: {$regex: payload.category, $options: 'i'}});
        if(category){
            payload ={...payload, category: category._id}
        }else {
            delete payload.category;
            }
        }

        if (payload.tag && Array.isArray(payload.tag) && payload.tag.length > 0) {
            let tag = await Tags.find({ name: { $in: payload.tag } });
            console.log('Tag ditemukan:', tag);
        
            if (Array.isArray(tag) && tag.length > 0) {
                payload = { ...payload, tag: tag.map(t => t._id) };
            } else {
                delete payload.tag;
            }
        }
        
        
        if (req.file && req.file.originalname) {
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.join(config.rootPath, `public/images/products/${filename}`);

            ensureDirectoryExistence(target_path);

            if (!fs.existsSync(tmp_path)) {
                console.error("File sementara tidak ditemukan:", tmp_path);
                return res.status(500).json({ error: "File sementara tidak ditemukan sebelum proses copy." });
            }

            try {
                // Mendapatkan data produk untuk mendapatkan path gambar lama
                let product = await Product.findById(id);
                let currentImg = path.join(config.rootPath, `public/images/products/${product.image_url}`);

                // Menyalin gambar baru dan menghapus file sementara
                await fsPromises.copyFile(tmp_path, target_path);
                await fsPromises.unlink(tmp_path);

                if (fs.existsSync(target_path)) {
                    console.log("File tersimpan di:", target_path);
                } else {
                    console.error("File tidak ditemukan di:", target_path);
                    return res.status(500).json({ error: "File tidak ditemukan di lokasi tujuan setelah proses copy." });
                }

                // Menghapus gambar lama jika ada dan berbeda dengan gambar baru
                if (product.image_url && fs.existsSync(currentImg)) {
                    await fsPromises.unlink(currentImg);
                }

                // Tambahkan nama file gambar baru ke payload untuk diupdate
                payload.image_url = filename;

                // Update produk di database
                let updatedProduct = await Product.findByIdAndUpdate(id, payload, {
                    new: true,
                    runValidators: true
                });

                return res.json(updatedProduct);
            } catch (err) {
                console.error("Error saat menyalin file atau menyimpan produk:", err);
                
                if (fs.existsSync(target_path)) {
                    fs.unlinkSync(target_path);
                }

                if (err && err.name === 'ValidationError') {
                    return res.status(400).json({
                        error: 1,
                        message: err.message,
                        fields: err.errors
                    });
                }
                
                next(err);
            }

        } else {
            let product = await Product.findByIdAndUpdate(id, payload, {
                new: true,
                runValidators: true
            });
            return res.json(product);
        }
    } catch (err) {
        next(err); 
    }
};

const index = async (req, res, next) => {
    try {
        let {q = '', category = '', tag = []} = req.query;

        let criteria = {};

        if(q.length){
            criteria = {...criteria, name: { $regex: `${q}`, $options: 'i' }}
        }

        if(category.length){
            let categoryResult = await Category.findOne({name: { $regex: `${category}`, $options: 'i' }});
            if(categoryResult){
                criteria = {
                    ...criteria,
                    category: categoryResult._id
                }
            }
            if(tag.length){
                let tagResult = await Tags.find({name: {$in: tag}});
                if(tagResult.length){
                    criteria = {
                        ...criteria,
                        tags: {$in: tagResult.map(t => t._id)}
                    }
                }
            }
        }
        
        let count = await Product.find().countDocuments();

        let product = await Product
        .find(criteria)
        // .skip(0)
        // .limit(10)
        .populate('category')
        .populate('tag')
        return res.json({
            data: product,
            count
        });
    }catch(err){
        next(err);
    }
};

const destroy = async (req, res, next) => {
    try {
        let product = await Product.findOneAndDelete({ _id: req.params.id });
        
        if (!product) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        let currentImg = path.join(config.rootPath, `public/images/products/${product.image_url}`);

        if (fs.existsSync(currentImg)) {
            fs.unlinkSync(currentImg);
        }

        return res.json({ message: "Produk dan gambar berhasil dihapus" });
    } catch (err) {
        next(err);
    }
};

module.exports = { 
    store,
    update,
    index,
    destroy
};
