import { server } from "./config/instance";
import './socket/index.js'

const port = 8080;

server.listen(port, () => {
    console.log(`server listening to port ${port}`)
})