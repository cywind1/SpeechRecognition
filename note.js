// requiring Mongoose package

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const note_schema = new Schema({
    note_id: {
        type: String,
        required: true
      },
    message: {
        type: String,
        required: true
      },
},{timestamps:true});

const Note = mongoose.model('Note', note_schema);
module.exports = Note;