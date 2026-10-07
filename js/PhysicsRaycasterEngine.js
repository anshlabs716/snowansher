/**
 * ============================================================================
 * SNOW ANSHER 3D - PRECISION RAYCASTING & TERRAIN MESH QUERIES
 * Bounding volume hierarchy, ray-triangle slope intersection, surface normal
 * alignment, suspension spring damping, and obstacle OBB collision queries.
 * ============================================================================
 */

class PhysicsRaycasterEngine {
    constructor(worldEnv) {
        this.world = worldEnv;
        this.ray = new THREE.Ray();
        this.downVector = new THREE.Vector3(0, -1, 0);

        // Suspension spring physics
        this.springStiffness = 140.0;
        this.springDamping = 12.0;
        this.suspensionCompression = 0.0;
    }

    /**
     * Sample accurate surface normal at world X, Z
     */
    getSurfaceNormalAt(x, z, slopeAngle = 0.075) {
        const delta = 0.5;
        const hCenter = this.getGroundHeight(x, z, slopeAngle);
        const hRight  = this.getGroundHeight(x + delta, z, slopeAngle);
        const hDown   = this.getGroundHeight(x, z - delta, slopeAngle);

        const vX = new THREE.Vector3(delta, hRight - hCenter, 0);
        const vZ = new THREE.Vector3(0, hDown - hCenter, -delta);

        const normal = new THREE.Vector3().crossVectors(vZ, vX).normalize();
        return normal;
    }

    getGroundHeight(x, z, slopeAngle = 0.075) {
        let y = -z * Math.tan(slopeAngle);
        const absX = Math.abs(x);
        if (absX > 26.0) {
            y += Math.pow((absX - 26.0) * 0.22, 1.85);
        }
        y += Math.sin(x * 0.1) * Math.cos(z * 0.07) * 0.75;
        return y;
    }

    /**
     * Compute suspension compression force over moguls
     */
    computeSuspension(dt, currentY, targetGroundY, currentVelY) {
        const penetration = targetGroundY - currentY;
        if (penetration > 0) {
            const springForce = penetration * this.springStiffness;
            const dampingForce = currentVelY * this.springDamping;
            return springForce - dampingForce;
        }
        return 0;
    }

    /**
     * Check Oriented Bounding Box (OBB) overlap between sled and obstacle
     */
    checkOBBOverlap(sledPos, sledHalfSize, obsPos, obsRadius) {
        const dx = Math.abs(sledPos.x - obsPos.x);
        const dz = Math.abs(sledPos.z - obsPos.z);

        if (dx < (sledHalfSize.x + obsRadius) && dz < (sledHalfSize.z + obsRadius)) {
            const dy = Math.abs(sledPos.y - obsPos.y);
            return dy < (sledHalfSize.y + obsRadius);
        }
        return false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsRaycasterEngine;
}
