import { relationship, file, timestamp, text } from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions, isNotAdmin, isSuperAdmin } from "../application/access";
import excelFileToJson from "../services/excelFileToJson";
import { Vehicle } from "@prisma/client";

interface VehicleDTO {
  loan_agreement_no: string;
  customer_name: string;
  make_model: string;
  variant: string;
  categoty: string;
  fuel_type: string;
  power_steering: string;
  autobse_contact:string;
  autobse_contact_person:string;
  vehicle_condition:string;
  shape:string;
  color:string;
  state:string;
  city: string;
  area:string;
  yard_name:string;
  payment_terms:string;
  date_of_registration:string;
  tax_type:string;
  tax_validity_date:string;
  rc_status: string;
  registration_number: string;
  year_of_manufacture: string;
  ownership: number;
  mileage: string;
  km : number;
  quote_increament: number;
  insurance_status: string;
  yard_location: string;
  hypothication: string;
  climate_control: string;
  door_count:string;
  gear_box:string;
  buyer_fees: string;
  rto_fine:string;
  parking_rate: string;
  approx_parking_charges: string;
  client_contact_person: string;
  client_contact_no: string;
  additional_remarks:string;
  start_price: number;
  reserve_price: number;
  repo_dt: string;
  veicle_location: string;
  vehicle_remarks: string;
  auction_manager: string;
  seller_name: string;
  parking_charges: number;
  insurance: string;
  insurance_type:string;
  insurance_valid_till: string;
  insurance_expiry_date: string;
  tax: string;
  fitness: string;
  permit: string;
  engine_no: string;
  chassis_no: string;
  front_image: string;
  back_image: string;
  left_image: string;
  right_image: string;
  inspection_link: string;
  image_6: string;
  image_5: string;
}

export const ExcelUpload = list({
  access: {
    operation: {
      query: () => true,
      create: isSuperAdmin,
      update: isSuperAdmin,
      delete: isSuperAdmin,
    },
  },
  ui: {
    isHidden: isNotAdmin,
    hideDelete: isNotAdmin,
  },
  hooks: {
    afterOperation: async ({ context, operation, resolvedData, item }) => {
      if (operation === "create") {
        // console.log("resolvedData", resolvedData);
        const { file, event } = resolvedData;
        try {
          const [data, eventData] = await Promise.all([
            excelFileToJson(
              `${process.cwd()}/public/files/excel/${file.filename}`,
              "Sheet1"
            ),
            context.query.Event.findOne({
              where: { id: event.connect.id },
              query: `endDate startDate eventCategory vehicleLiveTimeIn gapInBetweenVehicles`,
            }),
          ]);
          if (data.length > 0) {
            const vehicles: Vehicle[] = data.map(
              (vehicle:any, i: number) => {
                const vehicleItem = {} as VehicleDTO;
                Object.keys(vehicle).forEach(key => 
                  // @ts-ignore
                  {vehicleItem[`${key?.trim()?.toString()?.toLowerCase()?.replaceAll(' ', '_').replaceAll('.', '')}`] = vehicle[key]
                });
                // console.log("vehicleItem: ", vehicleItem);
                return {
                  registrationNumber:
                    vehicleItem.registration_number?.toString()?.toUpperCase()?.trim(),
                  loanAgreementNo:
                    vehicleItem.loan_agreement_no?.toString()?.toUpperCase()?.trim(),
                  registeredOwnerName:vehicleItem.customer_name?.trim(),
                  make: vehicleItem.make_model?.toString()?.toLowerCase()?.trim(),
                  model: vehicleItem.make_model?.toString()?.toLowerCase()?.trim(),
                  varient: vehicleItem.variant?.toString()?.toLowerCase()?.trim(),
                  categoty: vehicleItem.categoty?.toString()?.toLowerCase()?.trim(),
                  fuel: vehicleItem.fuel_type?.toString()?.toLowerCase()?.trim(),
                  rcStatus: vehicleItem.rc_status?.toString()?.toLowerCase()?.trim(),
                  yearOfManufacture: Number(vehicleItem.year_of_manufacture)||0,
                  ownership: Number(vehicleItem.ownership)||0,
                  mileage: Number(vehicleItem.mileage)||0,
                  kmReading: Number(vehicleItem.km)||0,
                  quoteIncreament: Number(vehicleItem.quote_increament)||1000,
                  insuranceStatus: vehicleItem.insurance_status?.toString()?.toUpperCase()?.trim(),
                  yardLocation: vehicleItem.yard_name?.trim()?? vehicleItem.yard_location?.trim(),
                  startPrice: Number(vehicleItem.start_price)||0,
                  reservePrice: Number(vehicleItem.reserve_price)||0,
                  repoDt: new Date(vehicleItem.repo_dt),
                  veicleLocation: vehicleItem.veicle_location?.toString()?.toUpperCase()?.trim(),
                  vehicleRemarks: vehicleItem.additional_remarks ?? vehicleItem.vehicle_remarks,
                  auctionManager: vehicleItem.auction_manager?.toString(),
                  parkingCharges: vehicleItem.parking_charges?.toString(),
                  insurance: vehicleItem.insurance_type??vehicleItem.insurance,
                  insuranceValidTill: new Date(vehicleItem.insurance_expiry_date)?? new Date (vehicleItem.insurance_valid_till),
                  tax: vehicleItem.tax_type??vehicleItem.tax,
                  taxValidityDate: new Date(vehicleItem.tax_validity_date),
                  fitness: vehicleItem.fitness,
                  permit: vehicleItem.permit,
                  engineNo: vehicleItem.engine_no,
                  chassisNo: vehicleItem.chassis_no,
                  frontImage: vehicleItem.front_image?.toString()?.trim(),
                  backImage: vehicleItem.back_image?.toString()?.trim(),
                  leftImage: vehicleItem.left_image?.toString()?.trim(),
                  rightImage: vehicleItem.right_image?.toString()?.trim(),
                  image5: vehicleItem.image_5?.toString()?.trim(),
                  image6: vehicleItem.image_6?.toString()?.trim(),
                  inspectionLink: vehicleItem.inspection_link?.toString()?.trim(),
                  autobseContact: vehicleItem.autobse_contact?.toString(),
                  autobse_contact_person: vehicleItem.autobse_contact_person?.trim(),
                  vehicleCondition: vehicleItem.vehicle_condition?.trim(),
                  powerSteering:vehicleItem.power_steering?.toString()?.toUpperCase()?.trim(),
                  shape:vehicleItem.shape?.toString()?.toUpperCase()?.trim(),
                  color: vehicleItem.color?.toString()?.toUpperCase()?.trim(),
                  state: vehicleItem.state?.toString()?.toUpperCase()?.trim(),
                  city: vehicleItem.city?.toString()?.toUpperCase()?.trim(),
                  area: vehicleItem.area?.toString()?.toUpperCase()?.trim(),
                  paymentTerms:vehicleItem.payment_terms,
                  dateOfRegistration: new Date(vehicleItem.date_of_registration),
                  hypothication: vehicleItem.hypothication,
                  climateControl: vehicleItem.climate_control,
                  doorCount: Number(vehicleItem.door_count) || 0,
                  gearBox: vehicleItem.gear_box,
                  buyerFees: vehicleItem.buyer_fees,
                  rtoFine:vehicleItem.rto_fine,
                  parkingRate: vehicleItem.parking_rate,
                  approxParkingCharges: vehicleItem.approx_parking_charges,
                  clientContactPerson: vehicleItem.client_contact_person,
                  clientContactNo: vehicleItem.client_contact_no.toString(),
                  additionalRemarks: vehicleItem.additional_remarks,
                  ExcelFile: { connect: { id: item.id } },
                  event: resolvedData.event,
                  bidTimeExpire:
                    eventData?.eventCategory === "open"
                      ? new Date(
                          new Date(eventData.startDate).getTime() +
                            eventData.vehicleLiveTimeIn * 60000 +
                            (eventData.vehicleLiveTimeIn * 60000 +
                              eventData.gapInBetweenVehicles * 1000) *
                              i
                        )
                      : new Date(
                          new Date(eventData.endDate).getTime() +
                            eventData.gapInBetweenVehicles * 60000 * i
                        ),
                  bidStartTime:
                    eventData?.eventCategory === "open"
                      ? new Date(
                          new Date(eventData.startDate).getTime() +
                            (eventData.vehicleLiveTimeIn * 60000 +
                              eventData.gapInBetweenVehicles * 1000) *
                              i
                        )
                      : new Date(eventData.startDate),
                  currentBidAmount: 0,
                  startBidAmount: Number(vehicleItem.start_price) || 0,
                  bidStatus: "pending",
                };
              }
            );
            // console.log("vehicles: ", vehicles)
            await context.query.Vehicle.createMany({
              data: vehicles,
            });

            // console.log("result", result);
          }
        } catch (e) {
          console.log("e", e);
        }
      }
    },
  },
  fields: {
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    file: file({
      storage: "local_files",
      hooks: {
        validateInput: ({
          addValidationError,
          resolvedData,
          fieldKey,
          operation,
        }) => {
          if (operation === "create") {
            const file = resolvedData[fieldKey];
            file.filename.split(".").pop() !== "xlsx" &&
              addValidationError("Only xlsx files are allowed");
          }
        },
      },
    }),
    event: relationship({
      ref: "Event.ExcelFile",
      many: false,
    }),
    vehicles: relationship({
      ref: "Vehicle.ExcelFile",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),

    createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
