import { relationship, file, timestamp, text } from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions, isNotAdmin, isSuperAdmin } from "../application/access";
import excelFileToJson from "../services/excelFileToJson";
import { Vehicle } from "@prisma/client";

interface VehicleDTO {
  Loan_Agreement_No: string;
  Customer_Name: string;
  Make_Model: string;
  Variant: string;
  Categoty: string;
  "Fuel Type": string;
  RC_Status: string;
  Registration_Number: string;
  Year_of_Manufacture: string;
  Ownership: number;
  Mileage: string;
  km : number;
  Quote_increament: number;
  Insurance_Status: string;
  Yard_Location: string;
  Start_Price: number;
  Reserve_Price: number;
  Repo_Dt: string;
  Veicle_Location: string;
  Vehicle_Remarks: string;
  "Auction Manager": string;
  "Action Manager": string;
  "Seller Name": string;
  "Parking Charges": number;
  Insurance: string;
  "Insurance Valid Till": string;
  Tax: string;
  Fitness: string;
  Permit: string;
  "Engine No": string;
  "Chassis NO": string;
  front_image: string;
  back_image: string;
  left_image: string;
  right_image: string;
  "INSPECTION LINK": string;
  "image 6": string;
  "image 7": string;
  "image 8": string;
  "image 9": string;
  "image 10": string;
  "image 11": string;
  "image 12": string;
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
          // console.log("data", data);
          if (data.length > 0) {
            const vehicles: Vehicle[] = data.map(
              (vehicleItem: VehicleDTO, i: number) => {
                return {
                  registrationNumber:
                    vehicleItem.Registration_Number.toUpperCase().trim(),
                  loanAgreementNo:
                    vehicleItem.Loan_Agreement_No?.toUpperCase()?.trim(),
                  registeredOwnerName:vehicleItem.Customer_Name?.trim(),
                  make: vehicleItem.Make_Model?.toLowerCase()?.trim(),
                  model: vehicleItem.Make_Model?.toLowerCase()?.trim(),
                  varient: vehicleItem.Variant?.toLowerCase()?.trim(),
                  categoty: vehicleItem.Categoty?.toLowerCase()?.trim(),
                  fuel: vehicleItem["Fuel Type"]?.toLowerCase()?.trim(),
                  rcStatus: vehicleItem.RC_Status?.toLowerCase()?.trim(),
                  yearOfManufacture: Number(vehicleItem.Year_of_Manufacture)||0,
                  ownership: Number(vehicleItem.Ownership)||0,
                  mileage: Number(vehicleItem.Mileage)||0,
                  kmReading: Number(vehicleItem.km)||0,
                  quoteIncreament: Number(vehicleItem.Quote_increament)||1000,
                  insuranceStatus: vehicleItem.Insurance_Status?.toUpperCase()?.trim(),
                  yardLocation: vehicleItem.Yard_Location?.toUpperCase()?.trim(),
                  startPrice: Number(vehicleItem.Start_Price)||0,
                  reservePrice: Number(vehicleItem.Reserve_Price)||0,
                  repoDt: new Date(Date.parse(vehicleItem.Repo_Dt)||0),
                  veicleLocation: vehicleItem.Veicle_Location?.toUpperCase()?.trim(),
                  vehicleRemarks: vehicleItem.Vehicle_Remarks,
                  auctionManager: vehicleItem["Auction Manager"]?.toString(),
                  actionManager: vehicleItem["Action Manager"],
                  sellerName: vehicleItem["Seller Name"],
                  parkingCharges: vehicleItem["Parking Charges"]?.toString(),
                  insurance: vehicleItem.Insurance,
                  insuranceValidTill: vehicleItem["Insurance Valid Till"],
                  tax: vehicleItem.Tax,
                  fitness: vehicleItem.Fitness,
                  permit: vehicleItem.Permit,
                  engineNo: vehicleItem["Engine No"],
                  chassisNo: vehicleItem["Chassis NO"],
                  frontImage: vehicleItem.front_image?.trim(),
                  backImage: vehicleItem.back_image?.trim(),
                  leftImage: vehicleItem.left_image?.trim(),
                  rightImage: vehicleItem.right_image?.trim(),
                  image5: vehicleItem["image 5"].trim(),
                  image6: vehicleItem["image 6"].trim(),
                  inspectionLink: vehicleItem["INSPECTION LINK"]?.trim(),
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
                  startBidAmount: Number(vehicleItem.Start_Price) || 0,
                  bidStatus: "pending",
                };
              }
            );
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
