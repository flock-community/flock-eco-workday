import {HttpUtils} from './HttpUtils.js';

function getWorkday() {
    return HttpUtils.get(
        '/api/workday',
        '')
}

function postWorkday() {

}

export const WorkdayClient = {
    getWorkday
}