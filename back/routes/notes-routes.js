const express = require('express');
const {createNote,getALLNotes,deleteNote ,updateNote, getNotesWithSearch} = require('../controller/notes-controlller');
const router = express.Router();

const noteRoutes = (io) =>{

    router.post("/create",createNote);
    router.get("/getAllNotes/:userId",getALLNotes)
    router.delete('/delete', (req,res,nex)=>{
        deleteNote(req,res,nex,io);
    });
    router.put("/updateNote",updateNote)
    router.get("/getNotes/:userId/:appointmentId", getNotesWithSearch);

return router;
}

module.exports= noteRoutes;

