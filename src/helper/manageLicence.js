import { GoogleSpreadsheet } from "google-spreadsheet";
import { compareWithMacAddresses, getMacAddress } from ".";
import AppConfig from "../app";
import constant from "../constant";
import { logError, logInfo } from "../logger";
import Logs from "../logs.json";
import GoogleSheetCredentials from '../client_secret.json';


const SPREAD_SHEET_ID = AppConfig.spreadSheetId;
const sheetKeys = AppConfig.sheetKeys;

const getLicenceInformation = async (licenceKey) => {
    try {
        const doc = new GoogleSpreadsheet(SPREAD_SHEET_ID);
        await doc.useServiceAccountAuth(GoogleSheetCredentials);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const allRows = await sheet.getRows();
        const row = allRows.find(x => x[sheetKeys.licenceKey] === licenceKey);
        if (row && row[sheetKeys.status] !== constant.expired) {
            if (row[sheetKeys.macAddress]) {
                return {
                    isValid: compareWithMacAddresses().includes(row[sheetKeys.macAddress]),
                    message: Logs.INVALID_MACHINE
                };
            } else {
                logInfo(Logs.LICENCE_ACTIVATION);
                row[sheetKeys.macAddress] = getMacAddress();
                await row.save();
                return {
                    isValid: true,
                    message: Logs.VALID_LICENCE
                };
            }
        }
        return {
            isValid: false,
            message: (row && row[sheetKeys.status] === constant.expired ?
                Logs.LICENCE_EXPIRED : Logs.INVALID_LICENCE
            )
        };
    } catch (e) {
        logError('getLicenceInformation error', e);
    }
}

export const checkLicenceValidation = async (licenceKey) => {
    try {
        const result = await getLicenceInformation(licenceKey);
        setInterval(() => {
            checkLicenceValidation();
        }, 3600000);
        if (!result?.isValid && result?.message) {
            logError(result.message);
            process.exit();
        }
    } catch (e) {
        logError('checkLicenceValidation error', e);
    }
}