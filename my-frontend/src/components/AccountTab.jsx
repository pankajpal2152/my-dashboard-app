// src/components/AccountTab.jsx
import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import { State, City } from 'country-state-city';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- 1. DATA & CONFIGURATION ---
const DUMMY_AVATAR = "https://api.dicebear.com/8.x/initials/svg?seed=Rajesh&backgroundColor=696cff";
const indianZipRegex = /^[1-9][0-9]{5}$/;
const indianPhoneRegex = /^(?:\+91[\s]?|91[\s]?)?[6789]\d{9}$/;

const accountSchema = z.object({
    joiningAmount: z.string().min(1, "Joining Amount is required"),
    walletBalance: z.string().optional(),
    fullName: z.string().min(2, "Min 2 characters").max(50, "Max 50 characters").regex(/^[a-zA-Z\s]+$/, "Letters only"),
    sdwOf: z.string().optional(),
    dob: z.string().min(1, "Date of Birth is required"),
    nomineeName: z.string().optional(),
    state: z.object({ value: z.string(), label: z.string() }).nullable().optional(),
    district: z.object({ value: z.string(), label: z.string() }).nullable().optional(),
    city: z.string().optional(),
    block: z.string().optional(),
    postOffice: z.string().optional(),
    policeStation: z.string().optional(),
    gramPanchayet: z.string().optional(),
    village: z.string().optional(),
    pinCode: z.string().regex(indianZipRegex, "Valid 6-digit Pincode required").length(6, "Must be exactly 6 digits"),
    mobileNo: z.string().regex(indianPhoneRegex, "Valid Indian phone required"),
    email: z.string().email("Please enter a valid email address").max(100, "Max 100 characters"),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    accountNo: z.string().optional(),
    ifsCode: z.string().optional(),
    panNo: z.string().optional(),
    aadharNo: z.string().length(12, "Must be exactly 12 digits").regex(/^\d+$/, "Numbers only"),
    deactivateConfirm: z.boolean().optional()
});

const indianStates = State.getStatesOfCountry('IN').map(state => ({ value: state.isoCode, label: state.name }));

// --- 2. STYLES ---
const styles = {
    card: { backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px 0 rgba(67, 89, 113, 0.12)', fontFamily: '"Public Sans", sans-serif', overflow: 'visible', marginBottom: '24px' },
    cardHeader: { padding: '24px', borderBottom: '1px solid #d9dee3', fontSize: '1.125rem', fontWeight: '500', color: '#566a7f', margin: 0 },
    cardBody: { padding: '24px' },
    profileSection: { display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' },
    avatar: { width: '100px', height: '100px', borderRadius: '6px', objectFit: 'cover' },
    buttonGroup: { display: 'flex', gap: '16px', marginBottom: '12px', marginTop: '10px' },
    btnPrimary: { backgroundColor: '#2b84b8', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 24px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    btnOutline: { backgroundColor: 'transparent', color: '#697a8d', border: '1px solid #d9dee3', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    btnDanger: { backgroundColor: '#ff3e1d', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    hintText: { color: '#a1acb8', fontSize: '0.8125rem', margin: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.75rem', fontWeight: '600', color: '#566a7f', textTransform: 'uppercase', letterSpacing: '0.25px' },
    input: (hasError) => ({ padding: '10px 14px', borderRadius: '4px', border: hasError ? '1px solid #ff3e1d' : '1px solid #d9dee3', fontSize: '0.9375rem', color: '#697a8d', outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit' }),
    inputDisabled: { padding: '10px 14px', borderRadius: '4px', border: '1px solid #d9dee3', fontSize: '0.9375rem', color: '#a1acb8', outline: 'none', backgroundColor: '#eceeef', cursor: 'not-allowed', fontFamily: 'inherit' },
    errorText: { color: '#ff3e1d', fontSize: '0.75rem', margin: 0, marginTop: '-4px' },
    selectStyles: (hasError) => ({
        control: (base) => ({ ...base, borderColor: hasError ? '#ff3e1d' : '#d9dee3', minHeight: '42px', borderRadius: '4px', boxShadow: 'none', '&:hover': { borderColor: '#2b84b8' } }),
        singleValue: (base) => ({ ...base, color: '#697a8d', fontSize: '0.9375rem' }),
        placeholder: (base) => ({ ...base, color: '#b4bdc6', fontSize: '0.9375rem' }),
        menu: (base) => ({ ...base, zIndex: 9999 })
    }),
    warningBox: { backgroundColor: 'rgba(255, 171, 0, 0.16)', padding: '16px', borderRadius: '6px', marginBottom: '16px' },
    warningTitle: { color: '#ffab00', fontSize: '0.9375rem', fontWeight: '600', margin: '0 0 4px 0' },
    warningText: { color: '#ffab00', fontSize: '0.875rem', margin: 0 },
    sectionHeader: { fontSize: '1rem', fontWeight: '500', color: '#566a7f', textTransform: 'uppercase', marginBottom: '20px', marginTop: '32px', borderBottom: '2px solid #2b84b8', paddingBottom: '8px' }
};

const FormInput = ({ label, id, error, placeholder, disabled, ...props }) => (
    <div style={styles.inputGroup}>
        <label htmlFor={id} style={styles.label}>{label}</label>
        <input id={id} style={disabled ? styles.inputDisabled : styles.input(!!error)} placeholder={placeholder} disabled={disabled} {...props} />
        {error && <p style={styles.errorText}>{error.message}</p>}
    </div>
);

const AccountTab = () => {
    const [profileImage, setProfileImage] = useState(DUMMY_AVATAR);
    const fileInputRef = useRef(null);

    const { control, handleSubmit, register, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(accountSchema),
        mode: 'onChange',
        defaultValues: {
            joiningAmount: '',
            walletBalance: '0',
            fullName: '', sdwOf: '', dob: '', nomineeName: '',
            state: null, district: null, city: '', block: '', postOffice: '', policeStation: '', gramPanchayet: '', village: '', pinCode: '', mobileNo: '', email: '',
            bankName: '', branchName: '', accountNo: '', ifsCode: '', panNo: '', aadharNo: '',
            deactivateConfirm: false
        }
    });

    const selectedState = watch("state");
    const districtOptions = selectedState
        ? City.getCitiesOfState('IN', selectedState.value).map(city => ({ value: city.name, label: city.name }))
        : [];

    const handleUploadClick = () => fileInputRef.current.click();
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 800000) return toast.warning("Image size exceeds 800K.");
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);
        }
    };
    const handleResetImage = () => {
        setProfileImage(DUMMY_AVATAR);
        fileInputRef.current.value = "";
    };

    const onSubmit = async (data) => {
        // Build payload including the base64 profile image string
        const dbPayload = {
            ProfileImage: profileImage === DUMMY_AVATAR ? null : profileImage, // Send null if they didn't upload a custom photo
            PerName: data.fullName,
            FathersName: data.sdwOf || "",
            DOB: data.dob,
            NomineeName: data.nomineeName || "",
            StateId: 36,
            DistId: 1,
            BlockName: data.block || "",
            PO: data.postOffice || "",
            PS: data.policeStation || "",
            Village: data.village || "",
            Pincode: parseInt(data.pinCode),
            ContactNo: data.mobileNo,
            MailId: data.email,
            BankName: data.bankName || "",
            BranchName: data.branchName || "",
            AcctNo: data.accountNo || "0",
            IFSCode: data.ifsCode || "",
            PanNo: data.panNo || "",
            AadharNo: data.aadharNo,
            JoiningAmt: parseInt(data.joiningAmount) || 0,
            WalletBalance: parseInt(data.walletBalance) || 0,
            Status: 1,
            AprovedBy: null,
            AprovalDate: null,
            AprovalNumber: null
        };

        try {
            toast.loading("Saving to database...", { toastId: 'saving' });

            const response = await fetch('https://my-dashboard-app-ky8v.onrender.com/RegInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbPayload)
            });

            toast.dismiss('saving');

            if (response.ok) {
                toast.success("Success: Data saved to Cloud Database!", { position: "top-right" });
                reset();
                setProfileImage(DUMMY_AVATAR); // Reset image UI after successful save
            } else {
                toast.error("Failed to save data. Check backend logs.", { position: "top-right" });
            }
        } catch (error) {
            toast.dismiss('saving');
            toast.error("Network error. Could not reach server.", { position: "top-right" });
            console.error(error);
        }
    };

    const onError = () => toast.error("Error: Please check the red fields.", { position: "top-right" });

    const onDeactivate = (data) => {
        if (!data.deactivateConfirm) return toast.warning("Please confirm deactivation.");
        toast.error("Account Deactivated successfully. Logging out...");
    };

    return (
        <>
            <ToastContainer autoClose={3000} pauseOnHover={false} />
            <div style={styles.card}>
                <h5 style={styles.cardHeader}>New General Member</h5>
                <div style={styles.cardBody}>
                    <div style={styles.profileSection}>
                        <img src={profileImage} alt="Profile Avatar" style={styles.avatar} />
                        <div>
                            <div style={styles.buttonGroup}>
                                <button type="button" style={styles.btnOutline} onClick={handleUploadClick}>Upload new photo</button>
                                <button type="button" style={styles.btnOutline} onClick={handleResetImage}>Reset</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" style={{ display: 'none' }} />
                            </div>
                            <p style={styles.hintText}>Allowed JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit, onError)}>
                        <h6 style={styles.sectionHeader}>Sponsor Information <span style={{ color: '#ff3e1d', textTransform: 'none' }}>(Member ID : )</span></h6>
                        <div style={styles.formGrid}>

                            <Controller name="joiningAmount" control={control} render={({ field }) => (
                                <FormInput
                                    label={<>Joining Amount <span style={{ color: '#ff3e1d' }}>*</span></>}
                                    id="joiningAmount"
                                    error={errors.joiningAmount}
                                    placeholder="Enter Amount"
                                    type="number"
                                    {...field}
                                />
                            )} />

                            <Controller name="walletBalance" control={control} render={({ field }) => (
                                <FormInput label={<>Wallet Balance <span style={{ color: '#ff3e1d' }}>*</span></>} id="walletBalance" error={errors.walletBalance} disabled={true} readOnly {...field} />
                            )} />
                        </div>

                        <h6 style={styles.sectionHeader}>Personal Details</h6>
                        <div style={styles.formGrid}>
                            <Controller name="fullName" control={control} render={({ field }) => (
                                <FormInput label={<>Full Name <span style={{ color: '#ff3e1d' }}>*</span></>} id="fullName" error={errors.fullName} placeholder="Applicant Name" type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="sdwOf" control={control} render={({ field }) => (
                                <FormInput label="S/D/W of" id="sdwOf" error={errors.sdwOf} placeholder="S/D/W of" type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="dob" control={control} render={({ field }) => (
                                <FormInput label={<>Date of Birth <span style={{ color: '#ff3e1d' }}>*</span></>} id="dob" error={errors.dob} placeholder="DD/MM/YYYY" type="date" {...field} />
                            )} />
                            <Controller name="nomineeName" control={control} render={({ field }) => (
                                <FormInput label="Nominee Name" id="nomineeName" error={errors.nomineeName} placeholder="Nominee Name" type="text" maxLength={50} {...field} />
                            )} />
                        </div>

                        <h6 style={styles.sectionHeader}>Postal Address Information</h6>
                        <div style={styles.formGrid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Select State</label>
                                <Controller name="state" control={control} render={({ field }) => (
                                    <Select {...field} options={indianStates} styles={styles.selectStyles(!!errors.state)} placeholder="Select State" />
                                )} />
                                {errors.state && <p style={styles.errorText}>{errors.state.message}</p>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>District</label>
                                <Controller name="district" control={control} render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={districtOptions}
                                        styles={styles.selectStyles(!!errors.district)}
                                        placeholder="Select District"
                                        isDisabled={!selectedState}
                                    />
                                )} />
                                {errors.district && <p style={styles.errorText}>{errors.district.message}</p>}
                            </div>

                            <Controller name="city" control={control} render={({ field }) => (
                                <FormInput label="City" id="city" error={errors.city} placeholder="City" type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="block" control={control} render={({ field }) => (
                                <FormInput label="Block" id="block" error={errors.block} placeholder="Block" type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="postOffice" control={control} render={({ field }) => (
                                <FormInput label="Post Office" id="postOffice" error={errors.postOffice} placeholder="Post Office" type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="policeStation" control={control} render={({ field }) => (
                                <FormInput label="Police Station" id="policeStation" error={errors.policeStation} placeholder="Police Station" type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="gramPanchayet" control={control} render={({ field }) => (
                                <FormInput label="Gram Panchayet" id="gramPanchayet" error={errors.gramPanchayet} placeholder="Gram Panchayet" type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="village" control={control} render={({ field }) => (
                                <FormInput label="Village" id="village" error={errors.village} placeholder="Village" type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="pinCode" control={control} render={({ field }) => (
                                <FormInput label={<>Pin Code <span style={{ color: '#ff3e1d' }}>*</span></>} id="pinCode" error={errors.pinCode} placeholder="Pincode" type="text" maxLength={6} {...field} />
                            )} />
                            <Controller name="mobileNo" control={control} render={({ field }) => (
                                <FormInput label={<>Contact Number <span style={{ color: '#ff3e1d' }}>*</span></>} id="mobileNo" error={errors.mobileNo} placeholder="Mobile No." type="tel" maxLength={15} {...field} />
                            )} />
                            <Controller name="email" control={control} render={({ field }) => (
                                <FormInput label={<>Email ID <span style={{ color: '#ff3e1d' }}>*</span></>} id="email" error={errors.email} placeholder="Email ID" type="email" maxLength={100} {...field} />
                            )} />
                        </div>

                        <h6 style={styles.sectionHeader}>Banking & Payment Details</h6>
                        <div style={styles.formGrid}>
                            <Controller name="bankName" control={control} render={({ field }) => (
                                <FormInput label="Bank Name" id="bankName" error={errors.bankName} placeholder="Bank Name" type="text" maxLength={100} {...field} />
                            )} />
                            <Controller name="branchName" control={control} render={({ field }) => (
                                <FormInput label="Branch Name" id="branchName" error={errors.branchName} placeholder="Bank Branch Name" type="text" maxLength={100} {...field} />
                            )} />
                            <Controller name="accountNo" control={control} render={({ field }) => (
                                <FormInput label="Account No" id="accountNo" error={errors.accountNo} placeholder="Bank Ac No" type="text" maxLength={30} {...field} />
                            )} />
                            <Controller name="ifsCode" control={control} render={({ field }) => (
                                <FormInput label="IFS Code" id="ifsCode" error={errors.ifsCode} placeholder="Bank IFS Code" type="text" maxLength={20} {...field} />
                            )} />
                            <Controller name="panNo" control={control} render={({ field }) => (
                                <FormInput label="PAN No" id="panNo" error={errors.panNo} placeholder="Pan No." type="text" maxLength={10} {...field} />
                            )} />
                            <Controller name="aadharNo" control={control} render={({ field }) => (
                                <FormInput label={<>Aadhar No. <span style={{ color: '#ff3e1d' }}>*</span></>} id="aadharNo" error={errors.aadharNo} placeholder="Aadhar No." type="text" maxLength={12} {...field} />
                            )} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <button type="submit" style={styles.btnPrimary}>Submit</button>
                        </div>
                    </form>
                </div>
            </div>

            <div style={styles.card}>
                <h5 style={styles.cardHeader}>Delete Account</h5>
                <div style={styles.cardBody}>
                    <div style={styles.warningBox}>
                        <h6 style={styles.warningTitle}>Are you sure you want to delete your account?</h6>
                        <p style={styles.warningText}>Once you delete your account, there is no going back. Please be certain.</p>
                    </div>

                    <form onSubmit={handleSubmit(onDeactivate)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <input type="checkbox" id="deactivateConfirm" {...register("deactivateConfirm")} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                            <label htmlFor="deactivateConfirm" style={{ fontSize: '0.9375rem', color: '#697a8d', cursor: 'pointer' }}>
                                I confirm my account deactivation
                            </label>
                        </div>
                        <button type="submit" style={styles.btnDanger}>Deactivate Account</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AccountTab;