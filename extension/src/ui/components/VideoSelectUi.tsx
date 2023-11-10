import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CssBaseline from '@material-ui/core/CssBaseline';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { PaletteType } from '@material-ui/core';
import Bridge from '../bridge';
import {
    Message,
    UpdateStateMessage,
    VideoSelectModeCancelMessage,
    VideoSelectModeConfirmMessage,
    createTheme,
} from '@project/common';

interface Props {
    bridge: Bridge;
}

export interface VideoElement {
    src: string;
    imageDataUrl: string;
}

export default function VideoSelectUi({ bridge }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [themeType, setThemeType] = useState<string>('dark');
    const [videoElements, setVideoElements] = useState<VideoElement[]>([]);
    const [selectedVideoElementSrc, setSelectedVideoElementSrc] = useState<string>('');
    const [openedFromMiningCommand, setOpenedFromMiningCommand] = useState<boolean>(false);
    const { t } = useTranslation();

    const theme = useMemo(() => createTheme(themeType as PaletteType), [themeType]);

    useEffect(() => {
        return bridge.addClientMessageListener((message: Message) => {
            if (message.command !== 'updateState') {
                return;
            }

            const state = (message as UpdateStateMessage).state;

            if (state.open !== undefined) {
                setOpen(state.open);
            }

            if (state.themeType !== undefined) {
                setThemeType(state.themeType);
            }

            if (state.videoElements !== undefined) {
                setVideoElements(state.videoElements);
                setSelectedVideoElementSrc('');
            }

            if (state.openedFromMiningCommand !== undefined) {
                setOpenedFromMiningCommand(state.openedFromMiningCommand);
            }
        });
    }, [bridge]);

    const handleConfirm = useCallback(() => {
        const message: VideoSelectModeConfirmMessage = {
            command: 'confirm',
            selectedVideoElementSrc,
        };

        bridge.sendMessageFromServer(message);
        setOpen(false);
    }, [bridge, selectedVideoElementSrc]);

    const handleCancel = useCallback(() => {
        const message: VideoSelectModeCancelMessage = {
            command: 'cancel',
        };
        bridge.sendMessageFromServer(message);
    }, [bridge]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Dialog open={open} fullWidth maxWidth="sm">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        {t('extension.videoSelect.multipleVideoElements')}{' '}
                    </Typography>
                    <IconButton edge="end" onClick={() => handleCancel()}>
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
                <DialogContent>
                    {openedFromMiningCommand ? (
                        <DialogContentText>{t('extension.videoSelect.syncBeforeMine')}</DialogContentText>
                    ) : (
                        <DialogContentText>{t('extension.videoSelect.selectVideo')}</DialogContentText>
                    )}
                    <Grid container direction="column" spacing={2}>
                        <Grid item style={{ maxWidth: '100%' }}>
                            <TextField
                                select
                                fullWidth
                                color="secondary"
                                variant="filled"
                                label={t('extension.videoSelect.videoElement')}
                                value={selectedVideoElementSrc}
                                onChange={(e) => setSelectedVideoElementSrc(e.target.value)}
                            >
                                {videoElements.map((v) => (
                                    <MenuItem value={v.src} key={v.src}>
                                        <img style={{ maxWidth: 20, marginRight: 12 }} src={v.imageDataUrl} />
                                        {v.src}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item style={{ maxWidth: '100%' }}>
                            {selectedVideoElementSrc !== '' && (
                                <img
                                    style={{ width: '100%' }}
                                    src={videoElements.find((v) => v.src === selectedVideoElementSrc)!.imageDataUrl}
                                />
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirm}>{t('action.ok')}</Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
