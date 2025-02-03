import { server, app } from "./config/instance.js";
import usersRouter from "./routes/usersRouter.js";
import chatRouter from "./routes/chatRouter.js";
import "./socket/index.js";

const port = 8080;

app.use("/users", usersRouter);
app.use("/chat", chatRouter); 

server.listen(port, () => {
    console.log(`server listening on port ${port}`);
});
