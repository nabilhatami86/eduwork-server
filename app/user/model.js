const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bcrypt = require("bcrypt");

const userSchema = Schema(
    {
        full_name: {
            type: String,
            required: [true, "Nama harus diisi"],
            minlength: [3, "Panjang nama harus antara 3 - 255 karakter"],
            maxlength: [255, "Panjang nama harus antara 3 - 255 karakter"],
        },
        customer_id: {
            type: Number,
        },
        email: {
            type: String,
            required: [true, "Email harus diisi"],
            maxlength: [255, "Panjang email maksimal 255 karakter"],
        },
        password: {
            type: String,
            required: [true, "Password harus diisi"],
            minlength: [8, "Panjang password minimal 8 karakter"],
            maxlength: [255, "Panjang password maksimal 255 karakter"],
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
        token: [String],
    },
    { timestamps: true }
);

// Validasi format email
userSchema.path("email").validate(function (value) {
    const EMAIL_RE = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    return EMAIL_RE.test(value);
}, (attr) => `${attr.value} harus merupakan email yang valid!`);

// Validasi email unik
userSchema.path("email").validate(
    async function (value) {
        try {
            const count = await this.model("User").countDocuments({ email: value });
            console.log(`Validating email: ${value}, Count: ${count}`);
            return !count;
        } catch (err) {
            console.error("Error during email validation:", err);
            throw err;
        }
    },
    (attr) => `${attr.value} sudah terdaftar`
);


// Hash password sebelum menyimpan
const HASH_ROUND = 10;
userSchema.pre("save", function (next) {
    if (!this.password) {
        const error = new Error("Password tidak boleh kosong");
        return next(error);
    }
    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    next();
});

// Auto-increment untuk customer_id
userSchema.plugin(AutoIncrement, { inc_field: "customer_id" });

module.exports = model("User", userSchema);
