import type { Canvas } from '@api/canvas';
import type { Stage } from '@api/material';
import type { Sprite } from '@api/sprite';
import type { GameMap } from '@classes/map';
import type { Player } from '@classes/player';
import type { ParsedAssets, ParsedCharacterItem } from '@data/assetTypes';
import type { Writable } from 'svelte/store';

export interface GameProperties {
	assets: ParsedAssets;

	canvas: Canvas;
	stage: Sprite<Stage>;

	map: GameMap;

	player: Player;

	pause: boolean;

	kill(): void;

	spawnPlayer(u: ParsedCharacterItem): void;
}

// export interface HostedGameProperties {
// 	server: Server;

// 	remotes: Set<RemoteShipObject>;

// 	maxPlayers: number;
// 	ID: string;

// 	playerCount: number;

// 	queue: RemoteSendInfo[];
// 	open: Writable<boolean>;

// 	addRemote(): void;
// 	removeRemote(): void;
// }

// export interface ClientGameProperties {
// 	remotes: Set<RemoteShipObject>;

// 	connection: Client;

// 	init(m: MapItem, remotes: any[]): void;

// 	addRemote(): void;
// 	removeRemote(): void;
// }
