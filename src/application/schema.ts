import { User } from '../entities/users'
import { Event } from '../entities/events'
import { EventType } from '../entities/event-types'
import { EventCategory } from '../entities/event-categories'
import { Location } from '../entities/locations'
import { Vehicle } from '../entities/vehicles'
import { ExcelUpload } from '../entities/excel-upload'
import { Seller } from '../entities/sellers'
import { EmdUpdate } from "../entities/emd-updates";
import { Bid } from "../entities/bids";
import { State } from "../entities/states";
import { VehicleUser } from "../entities/vehicle-users";
import { Payment } from "../entities/payments";
export { router } from "./restRoutes";
export { extendGraphqlSchema } from "./graphqlRoutes";
export const lists = {
  User,
  Payment,
  EmdUpdate,
  Event,
  Vehicle,
  VehicleUser,
  Bid,
  EventType,
  Location,
  State,
  EventCategory,
  ExcelUpload,
  Seller,
};