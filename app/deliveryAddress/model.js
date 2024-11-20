const { Schema, model } = require('mongoose');

const DeliveryAddressSchema = Schema({
    name: {
        type: String, 
        required: [true, 'Nama Alamat Harus Diisi'],
        maxLength: [255, 'Panjang maksimal nama alamat adalah 255 karakter'],
        trim: true
    },
    kelurahan: {
        type: String,
        required: [true, 'Kelurahan Harus Diisi'],
        maxLength: [255, 'Panjang maksimal kelurahan adalah 255 karakter'],
        trim: true
    },
    kecamatan: {
        type: String,
        required: [true, 'Kecamatan Harus Diisi'],
        maxLength: [255, 'Panjang maksimal kecamatan adalah 255 karakter'],
        trim: true
    },
    kabupaten: {
        type: String,
        required: [true, 'kabupaten harus di isi'],
        maxlength: [255, 'panjang maksimal kabupaten alamat adalah 255 karakter']
    },
    provinsi: {
        type: String,
        required: [true, 'Provinsi Harus Diisi'],
        maxLength: [255, 'Panjang maksimal provinsi adalah 255 karakter'],
        trim: true
    },
    detail: {
        type: String,
        required: [true, 'Detail Alamat Harus Diisi'],
        maxLength: [1000, 'Panjang maksimal detail alamat adalah 1000 karakter'],
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = model('DeliveryAddress', DeliveryAddressSchema);
