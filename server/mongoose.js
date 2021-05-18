const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/pingDemo", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("<====mongodb is connected====>");
}).catch(() => {
    console.log("<====mongodb failed to connect====>");
});
