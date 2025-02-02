import { server, app } from "./config/instance.js";
import usersRouter from "./routes/usersRouter.js";
import './socket/index.js'

const port = 8080;

app.use("/users", usersRouter);

server.listen(port, () => {
    console.log(`server listening to port ${port}`)
})