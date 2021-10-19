import { Vec2 } from '@api/vec2';
import type { RectHitbox, CollisionType } from '@data/types';

export function rectangleCollision(
	r1: RectHitbox,
	r2: RectHitbox,
	react?: boolean,
	bounce?: boolean
): CollisionType {
	let collision: CollisionType;
	let overlap: Vec2 = new Vec2(0, 0);

	let cHalfSize: Vec2 = r1.halfSize.clone().add(r2.halfSize);
	let velocity: Vec2 = r1.position.clone().subtract(r2.position);

	if (Math.abs(velocity.x) < cHalfSize.x) {
		if (Math.abs(velocity.y) < cHalfSize.y) {
			overlap.x = cHalfSize.x - Math.abs(velocity.x);
			overlap.y = cHalfSize.y - Math.abs(velocity.y);

			if (overlap.x >= overlap.y) {
				if (velocity.y > 0) {
					collision = 'top';
					if (react) r1.position.y += overlap.y;
				} else {
					collision = 'bottom';
					if (react) r1.position.y -= overlap.y;
				}

				if (react && bounce) {
					if (react) r1.velocity.y *= -1;
				} else {
					if (react) r1.velocity.y = 0;
				}
			} else {
				if (velocity.x > 0) {
					collision = 'left';
					if (react) r1.position.x += overlap.x;
				} else {
					collision = 'right';
					if (react) r1.position.x -= overlap.x;
				}

				if (bounce) {
					if (react) r1.velocity.x *= -1;
				} else {
					if (react) r1.velocity.x = 0;
				}
			}
		} else {
			collision = '';
		}
	} else {
		collision = '';
	}

	return collision;
}
//function that adds to number if it is not zero
const addIfNotZero = (num: number, add: number) => num + add;

export function SegmentIntersection2(p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2) {
	const x1 = p1.x;
	const y1 = p1.y;
	const x2 = p2.x;
	const y2 = p2.y;
	const x3 = p3.x;
	const y3 = p3.y;
	const x4 = p4.x;
	const y4 = p4.y;

	const denom = (y4 - y3) * (x2 - x1) - (y2 - y1) * (x4 - x3);
	if (denom === 0) {
		return false;
	}

	const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
	const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

	return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

//function that returns true of a point is inside a pol
export function PointInPolygon(point: Vec2, polygon: Array<Vec2>): boolean {
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].x;
		const yi = polygon[i].y;
		const xj = polygon[j].x;
		const yj = polygon[j].y;

		const intersect =
			yi > point.y !== yj > point.y &&
			point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
		if (intersect) {
			inside = !inside;
		}
	}

	return inside;
}

export function PointInCircle(point: Vec2, circle: Vec2, radius: number): boolean {
	return Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2) <= Math.pow(radius, 2);
}
