import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8001;
try {
    app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});
} catch (error) {
    console.error("Error starting the server:", error);
}
