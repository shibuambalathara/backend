import { relationship, file, timestamp, text } from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions, isNotAdmin, isSuperAdmin } from "../application/access";
import excelFileToJson from "../services/excelFileToJson";
import { Vehicle } from "@prisma/client";

interface VehicleDTO {
  Loan_Agreement_No: String;
  "Registered Owner Name": String;
  Make: String;
  Model: String;
  Varient: String;
  Categoty: String;
  "Fuel Type": String;
  RC_Status: String;
  Registration_Number: String;
  Year_of_Manufacture: String;
  Ownership: Number;
  "KM Reading": Number;
  Insurance_Status: String;
  Yard_Location: String;
  Start_Price: Number;
  Reserve_Price: Number;
  Repo_Dt: Number;
  Veicle_Location: String;
  Vehicle_Remarks: String;
  "Auction Manager": String;
  "Action Manager": String;
  "Seller Name": String;
  "Parking Charges": Number;
  Insurance: String;
  "Insurance Valid Till": String;
  Tax: String;
  Fitness: String;
  Permit: String;
  "Engine No": String;
  "Chassis NO": String;
  front_image: String;
  back_image: String;
  left_image: String;
  right_image: String;
  "image 5": String;
  "image 6": String;
  "image 7": String;
  "image 8": String;
  "image 9": String;
  "image 10": String;
  "image 11": String;
  "image 12": String;
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
    hideDelete: true,
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
              query: `endDate `,
            }),
          ]);
          // console.log("data", data);
          if (data.length > 0) {
            const vehicles: Vehicle[] = data.map((vehicleItem: VehicleDTO) => {
              return {
                registrationNumber:
                  vehicleItem.Registration_Number.toUpperCase().trim(),
                loanAgreementNo:
                  vehicleItem.Loan_Agreement_No?.toUpperCase()?.trim(),
                make: vehicleItem.Make?.toLowerCase()?.trim(),
                model: vehicleItem.Model?.toLowerCase()?.trim(),
                varient: vehicleItem.Varient?.toLowerCase()?.trim(),
                categoty: vehicleItem.Categoty?.toLowerCase()?.trim(),
                fuel: vehicleItem["Fuel Type"]?.toLowerCase()?.trim(),
                rcStatus: vehicleItem.RC_Status?.toLowerCase()?.trim(),
                yearOfManufacture: vehicleItem.Year_of_Manufacture,
                ownership: vehicleItem.Ownership,
                kmReading: vehicleItem["KM Reading"],
                insuranceStatus: vehicleItem.Insurance_Status,
                yardLocation: vehicleItem.Yard_Location,
                startPrice: vehicleItem.Start_Price,
                reservePrice: vehicleItem.Reserve_Price,
                repoDt: vehicleItem.Repo_Dt,
                veicleLocation: vehicleItem.Veicle_Location,
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
                frontImage: vehicleItem.front_image,
                backImage: vehicleItem.back_image,
                leftImage: vehicleItem.left_image,
                rightImage: vehicleItem.right_image,
                image5: vehicleItem["image 5"],
                image6: vehicleItem["image 6"],
                image7: vehicleItem["image 7"],
                image8: vehicleItem["image 8"],
                image9: vehicleItem["image 9"],
                image10: vehicleItem["image 10"],
                image11: vehicleItem["image 11"],
                image12: vehicleItem["image 12"],
                ExcelFile: { connect: { id: item.id } },
                event: resolvedData.event,
                eventTimeExpire: eventData.endDate,
                bidTimeExpire: eventData.endDate,
                currentBidAmount: vehicleItem.Reserve_Price || 0,
                bidStatus: "pending",
              };
            });
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
