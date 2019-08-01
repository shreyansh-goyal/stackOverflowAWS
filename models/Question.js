const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "myperson"
    },
    textone:{   //it will contain the questions
        type: String,
        required: true
    },
    texttwo:{   //it will contain codes quest
        type: String,
        required: true
    },
    name:{
        type: String
    },
    upvote: [
        {
            user:{
                type: Schema.Types.ObjectId,
                ref: "myperson"
            }
        }
    ],
    answers:[
        {
            user:{
                type: Schema.Types.ObjectId,
                ref: "myperson"
            },
            text:{
                type: String,
                required: true
            },
            name:{
                type: String
            },
            date:{
                type: Date,
                default: Date.now
            }
        }
    ],
    date:{
        type: Date,
        default: Date.now
    }
    
})
module.exports = Question = mongoose.model("myquestion",QuestionSchema);