"use strict";
/**
 * DryJets Platform - Shared Types
 *
 * @description Central export for all TypeScript types across the monorepo
 * @usage
 *   // Types
 *   import type { MarketingProfile, Campaign, Content } from '@dryjets/types'
 *   // DTOs
 *   import { CreateProfileDto, UpdateProfileDto } from '@dryjets/types/dtos'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Core platform types
tslib_1.__exportStar(require("./src/user.types"), exports);
tslib_1.__exportStar(require("./src/order.types"), exports);
// Marketing domain types
tslib_1.__exportStar(require("./src/marketing"), exports);
// Marketing DTOs (Data Transfer Objects)
tslib_1.__exportStar(require("./src/dtos"), exports);
//# sourceMappingURL=index.js.map