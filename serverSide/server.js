import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import { errorHandler } from "./middleware/errorHandler";


const app = express();

app.use(cors());
dotenv.config();
app.use(express.json());



app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>
console.log(`Server online at port ${PORT}`)
)