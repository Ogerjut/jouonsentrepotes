import type { TypedServer } from "$lib/types/socket";
import { fromNodeHeaders } from "better-auth/node";
import { authServer } from "../auth/auth-server";

export function authMiddleware (io : TypedServer) {
    io.use(async (socket, next) => {
        try {
        const request = socket.request;
        const session = await authServer.api.getSession({
            headers: fromNodeHeaders(request.headers) 
        });

        if (!session?.user) {
            return next(new Error("Pas de session liée à l'user"));
        }

        socket.data.userId = session.user.id;
        socket.data.username = session.user.name
        console.log("socket.data :", socket.data)
        next();
        } catch (err) {
            next(new Error(`Unauthorized : ${err}`));
        }
    });
}
