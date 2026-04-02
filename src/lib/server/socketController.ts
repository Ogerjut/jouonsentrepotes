import type { TypedServer } from "$lib/types/socket";
import { CoreHandler } from './games/core/handler/CoreHandler.js';
import { tableService, presenceService, userService, gameServiceFactory, gameHandlerFactory, invitationService } from './games/core/bootstrap.js';
// import { PresenceHandler } from './games/core/handler/PresenceHandler';
import { authMiddleware } from './middlewares/AuthMiddleware.js';

export default function socketController(io : TypedServer) {
	console.log('🎮 Contrôleur de sockets initialisé !');
	userService.cleanAllCurrentTableId()
	authMiddleware(io)
	
	// fonction appelée à chaque nouvelle socket !!!! (déco/reco, crash....)
	io.on('connection', async (socket) => {
		console.log('✅ Nouveau client connecté:', socket.data.username);
		
		new CoreHandler(io, socket,
			userService, tableService, presenceService, invitationService,
			gameServiceFactory, gameHandlerFactory(io)
		)
		.onConnect()
	});

	io.engine.on('connection_error', (err) => {
		console.log('❌ Erreur Engine.IO:', err);
	});
}
