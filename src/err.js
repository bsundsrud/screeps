module.exports = (err) => {
    switch (err) {
        case 0: return 'OK';
        case -1: return 'ERR_NOT_OWNER';
        case -2: return 'ERR_NO_PATH';
        case -3: return 'ERR_NAME_EXISTS';
        case -4: return 'ERR_BUSY';
        case -5: return 'ERR_NOT_FOUND';
        case -6: return 'ERR_NOT_ENOUGH_ENERGY';
        case -6: return 'ERR_NOT_ENOUGH_RESOURCES';
        case -7: return 'ERR_INVALID_TARGET';
        case -8: return 'ERR_FULL';
        case -9: return 'ERR_NOT_IN_RANGE';
        case -10: return 'ERR_INVALID_ARGS';
        case -11: return 'ERR_TIRED';
        case -12: return 'ERR_NO_BODYPART';
        case -6: return 'ERR_NOT_ENOUGH_EXTENSIONS';
        case -14: return 'ERR_RCL_NOT_ENOUGH';
        case -15: return 'ERR_GCL_NOT_ENOUGH';
        default: return err;
    }
}