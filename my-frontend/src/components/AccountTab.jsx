// src/components/AccountTab.jsx
import React, { useState, useRef, useEffect } from 'react';
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
    guardianContactNo: z.string().optional(),
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
    card: { backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px 0 rgba(67, 89, 113, 0.12)', fontFamily: '"Public Sans", sans-serif', overflow: 'hidden', marginBottom: '24px', width: '100%', boxSizing: 'border-box' },
    cardHeader: { padding: '24px', borderBottom: '1px solid #d9dee3', fontSize: '1.125rem', fontWeight: '500', color: '#566a7f', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
    cardBody: { padding: '24px', width: '100%', boxSizing: 'border-box' },
    profileSection: { display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' },
    avatar: { width: '100px', height: '100px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 },
    buttonGroup: { display: 'flex', gap: '16px', marginBottom: '12px', marginTop: '10px', flexWrap: 'wrap' },
    btnPrimary: { backgroundColor: '#2b84b8', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 24px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' },
    btnOutline: { backgroundColor: 'transparent', color: '#697a8d', border: '1px solid #d9dee3', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' },
    btnDanger: { backgroundColor: '#ff3e1d', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' },
    btnSuccess: { backgroundColor: '#71dd37', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' },
    hintText: { color: '#a1acb8', fontSize: '0.8125rem', margin: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' },
    label: { fontSize: '0.75rem', fontWeight: '600', color: '#566a7f', textTransform: 'uppercase', letterSpacing: '0.25px' },
    input: (hasError) => ({ padding: '10px 14px', borderRadius: '4px', border: hasError ? '1px solid #ff3e1d' : '1px solid #d9dee3', fontSize: '0.9375rem', color: '#697a8d', outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }),
    inputDisabled: { padding: '10px 14px', borderRadius: '4px', border: '1px solid #d9dee3', fontSize: '0.9375rem', color: '#a1acb8', outline: 'none', backgroundColor: '#eceeef', cursor: 'not-allowed', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
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
    sectionHeader: { fontSize: '1rem', fontWeight: '500', color: '#566a7f', textTransform: 'uppercase', marginBottom: '20px', marginTop: '32px', borderBottom: '2px solid #2b84b8', paddingBottom: '8px' },

    tableContainer: { width: '100%', maxWidth: '100%', overflowX: 'auto', display: 'block', WebkitOverflowScrolling: 'touch' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '1200px' },
    th: { padding: '12px 16px', textAlign: 'left', backgroundColor: '#f5f5f9', color: '#566a7f', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #d9dee3', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' },
    td: { padding: '12px 16px', borderBottom: '1px solid #d9dee3', color: '#697a8d', fontSize: '0.9375rem', whiteSpace: 'nowrap' },

    stickyLeftTh: { position: 'sticky', left: 0, zIndex: 2, padding: '12px 16px', textAlign: 'left', backgroundColor: '#f5f5f9', color: '#566a7f', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #d9dee3', whiteSpace: 'nowrap', borderRight: '1px solid #d9dee3', cursor: 'pointer', userSelect: 'none' },
    stickyLeftTd: { position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#ffffff', padding: '12px 16px', borderBottom: '1px solid #d9dee3', color: '#697a8d', fontSize: '0.9375rem', whiteSpace: 'nowrap', borderRight: '1px solid #d9dee3' },
    stickyRightTh: { position: 'sticky', right: 0, zIndex: 2, padding: '12px 16px', textAlign: 'left', backgroundColor: '#f5f5f9', color: '#566a7f', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #d9dee3', whiteSpace: 'nowrap', borderLeft: '1px solid #d9dee3' },
    stickyRightTd: { position: 'sticky', right: 0, zIndex: 1, backgroundColor: '#ffffff', padding: '12px 16px', borderBottom: '1px solid #d9dee3', color: '#697a8d', fontSize: '0.9375rem', whiteSpace: 'nowrap', borderLeft: '1px solid #d9dee3' },

    actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', margin: '0 4px', color: '#697a8d' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxSizing: 'border-box' },
    closeBtn: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a1acb8', zIndex: 10 },

    paginationContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #d9dee3', flexWrap: 'wrap', gap: '10px', color: '#697a8d', fontSize: '0.875rem', backgroundColor: '#fff' },
    pageSelect: { padding: '4px 8px', borderRadius: '4px', border: '1px solid #d9dee3', color: '#697a8d', cursor: 'pointer', outline: 'none' },
    pageBtn: { padding: '6px 12px', marginLeft: '8px', border: '1px solid #d9dee3', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer', color: '#697a8d' },
    pageBtnDisabled: { padding: '6px 12px', marginLeft: '8px', border: '1px solid #d9dee3', backgroundColor: '#f5f5f9', borderRadius: '4px', cursor: 'not-allowed', color: '#a1acb8' }
};

const FormInput = ({ label, id, error, placeholder, disabled, ...props }) => (
    <div style={styles.inputGroup}>
        <label htmlFor={id} style={styles.label}>{label}</label>
        <input id={id} style={disabled ? styles.inputDisabled : styles.input(!!error)} placeholder={placeholder} disabled={disabled} {...props} />
        {error && <p style={styles.errorText}>{error.message}</p>}
    </div>
);

// ==========================================
// 3. EDIT MODAL WITH FULL VALIDATION
// ==========================================
const EditMemberModal = ({ member, onClose, onSuccess }) => {
    const [profileImage, setProfileImage] = useState(member.ProfileImage || DUMMY_AVATAR);
    const fileInputRef = useRef(null);

    const defaultState = indianStates.find(s => s.label === member.StateName) || null;
    const defaultDistrictOptions = defaultState ? City.getCitiesOfState('IN', defaultState.value).map(c => ({ value: c.name, label: c.name })) : [];
    const defaultDistrict = defaultDistrictOptions.find(c => c.label === member.DistName) || null;

    const { control, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(accountSchema),
        mode: 'onChange',
        defaultValues: {
            joiningAmount: String(member.JoiningAmt || '0'),
            walletBalance: String(member.WalletBalance || ''),
            fullName: member.PerName || '',
            sdwOf: member.GuardianName || '',
            dob: member.DOB ? member.DOB.substring(0, 10) : '',
            guardianContactNo: member.GuardianContactNo || '',
            state: defaultState,
            district: defaultDistrict,
            city: member.City || '',
            block: member.BlockName || '',
            postOffice: member.PO || '',
            policeStation: member.PS || '',
            gramPanchayet: member.GramPanchayet || '',
            village: member.Village || '',
            pinCode: String(member.Pincode || ''),
            mobileNo: member.ContactNo || '',
            email: member.MailId || '',
            bankName: member.BankName || '',
            branchName: member.BranchName || '',
            accountNo: member.AcctNo || '',
            ifsCode: member.IFSCode || '',
            panNo: member.PanNo || '',
            aadharNo: member.AadharNo || ''
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
        const stateName = data.state ? data.state.label : "";
        const districtName = data.district ? data.district.label : "";

        // Fetch current logged in user just in case we need a fallback
        const userStr = localStorage.getItem('loggedInUser');
        const loggedInUser = userStr ? JSON.parse(userStr) : null;

        const dbPayload = {
            ...member,
            ProfileImage: profileImage === DUMMY_AVATAR ? null : profileImage,
            PerName: data.fullName,
            GuardianName: data.sdwOf || "",
            DOB: data.dob,
            GuardianContactNo: data.guardianContactNo || "",
            StateName: stateName,
            DistName: districtName,
            City: data.city || "",
            BlockName: data.block || "",
            PO: data.postOffice || "",
            PS: data.policeStation || "",
            GramPanchayet: data.gramPanchayet || "",
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
            // Keep original creator, or fallback to current user if missing
            CreatedBy: member.CreatedBy || (loggedInUser ? loggedInUser.email : "")
        };

        if (dbPayload.DOB) dbPayload.DOB = dbPayload.DOB.substring(0, 10);
        if (dbPayload.AprovalDate && dbPayload.AprovalDate.includes('T')) dbPayload.AprovalDate = dbPayload.AprovalDate.substring(0, 10);

        try {
            toast.loading("Updating member...", { toastId: 'update' });

            const res = await fetch(`https://my-dashboard-app-ky8v.onrender.com/RegInfo/${member.RegInfoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbPayload)
            });

            toast.dismiss('update');

            if (res.ok) {
                toast.success("Member updated successfully!");
                onSuccess();
            } else {
                toast.error("Failed to update.");
            }
        } catch (error) {
            toast.dismiss('update');
            toast.error("Network error.");
        }
    };

    const onError = () => toast.error("Error: Please check the red fields.", { position: "top-right" });

    return (
        <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, maxWidth: '1000px', padding: '0' }}>
                <div style={styles.cardHeader}>
                    <h5 style={{ margin: 0 }}>Edit Member Details</h5>
                    <button style={styles.closeBtn} onClick={onClose}>×</button>
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.profileSection}>
                        <img src={profileImage} alt="Profile Avatar" style={styles.avatar} />
                        <div>
                            <p style={styles.hintText}><strong>ID:</strong> #{member.RegInfoId}</p>
                            <p style={styles.hintText}><strong>Status:</strong> {member.Status === 2 ? 'Approved' : 'Pending'}</p>
                            {member.Status === 2 && member.AprovedBy && (
                                <p style={styles.hintText}><strong>Approved By:</strong> {member.AprovedBy}</p>
                            )}
                            <div style={styles.buttonGroup}>
                                <button type="button" style={styles.btnOutline} onClick={handleUploadClick}>Change photo</button>
                                <button type="button" style={styles.btnOutline} onClick={handleResetImage}>Reset</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" style={{ display: 'none' }} />
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit, onError)}>
                        <h6 style={styles.sectionHeader}>Astha Didi Information</h6>
                        <div style={styles.formGrid}>
                            <Controller name="joiningAmount" control={control} render={({ field }) => (
                                <FormInput label={<>Joining Amount <span style={{ color: '#ff3e1d' }}>*</span></>} id="edit_joiningAmount" error={errors.joiningAmount} type="number" readOnly disabled={true} {...field} />
                            )} />
                            <Controller name="walletBalance" control={control} render={({ field }) => (
                                <FormInput label={<>Wallet Balance <span style={{ color: '#ff3e1d' }}>*</span></>} id="edit_walletBalance" error={errors.walletBalance} disabled={true} readOnly {...field} />
                            )} />
                        </div>

                        <h6 style={styles.sectionHeader}>Personal Details</h6>
                        <div style={styles.formGrid}>
                            <Controller name="fullName" control={control} render={({ field }) => (
                                <FormInput label={<>Full Name <span style={{ color: '#ff3e1d' }}>*</span></>} id="edit_fullName" error={errors.fullName} type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="sdwOf" control={control} render={({ field }) => (
                                <FormInput label="S/D/W of" id="edit_sdwOf" error={errors.sdwOf} type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="dob" control={control} render={({ field }) => (
                                <FormInput label={<>Date of Birth <span style={{ color: '#ff3e1d' }}>*</span></>} id="edit_dob" error={errors.dob} type="date" {...field} />
                            )} />
                            <Controller name="guardianContactNo" control={control} render={({ field }) => (
                                <FormInput label="Guardian Contact no" id="edit_guardianContactNo" error={errors.guardianContactNo} type="text" maxLength={50} {...field} />
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
                                    <Select {...field} options={districtOptions} styles={styles.selectStyles(!!errors.district)} placeholder="Select District" isDisabled={!selectedState} />
                                )} />
                                {errors.district && <p style={styles.errorText}>{errors.district.message}</p>}
                            </div>
                            <Controller name="city" control={control} render={({ field }) => (
                                <FormInput label="City" id="edit_city" error={errors.city} type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="block" control={control} render={({ field }) => (
                                <FormInput label="Block" id="edit_block" error={errors.block} type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="postOffice" control={control} render={({ field }) => (
                                <FormInput label="Post Office" id="edit_postOffice" error={errors.postOffice} type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="policeStation" control={control} render={({ field }) => (
                                <FormInput label="Police Station" id="edit_policeStation" error={errors.policeStation} type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="gramPanchayet" control={control} render={({ field }) => (
                                <FormInput label="Gram Panchayet" id="edit_gramPanchayet" error={errors.gramPanchayet} type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="village" control={control} render={({ field }) => (
                                <FormInput label="Village" id="edit_village" error={errors.village} type="text" maxLength={50} {...field} />
                            )} />
                            <Controller name="pinCode" control={control} render={({ field }) => (
                                <FormInput label={<>Pin Code <span style={{ color: '#ff3e1d' }}>*</span></>} id="edit_pinCode" error={errors.pinCode} type="text" maxLength={6} {...field} />
                            )} />
                            <Controller name="mobileNo" control={control} render={({ field }) => (
                                <FormInput label={<>Contact Number <span style={{ color: '#ff3e1d' }}>*</span></>} id="edit_mobileNo" error={errors.mobileNo} type="tel" maxLength={15} {...field} />
                            )} />
                            <Controller name="email" control={control} render={({ field }) => (
                                <FormInput label={<>Email ID <span style={{ color: '#ff3e1d' }}>*</span></>} id="edit_email" error={errors.email} type="email" maxLength={100} {...field} />
                            )} />
                        </div>

                        <h6 style={styles.sectionHeader}>Banking & Payment Details</h6>
                        <div style={styles.formGrid}>
                            <Controller name="bankName" control={control} render={({ field }) => (
                                <FormInput label="Bank Name" id="edit_bankName" error={errors.bankName} type="text" maxLength={100} {...field} />
                            )} />
                            <Controller name="branchName" control={control} render={({ field }) => (
                                <FormInput label="Branch Name" id="edit_branchName" error={errors.branchName} type="text" maxLength={100} {...field} />
                            )} />
                            <Controller name="accountNo" control={control} render={({ field }) => (
                                <FormInput label="Account No" id="edit_accountNo" error={errors.accountNo} type="text" maxLength={30} {...field} />
                            )} />
                            <Controller name="ifsCode" control={control} render={({ field }) => (
                                <FormInput label="IFS Code" id="edit_ifsCode" error={errors.ifsCode} type="text" maxLength={20} {...field} />
                            )} />
                            <Controller name="panNo" control={control} render={({ field }) => (
                                <FormInput label="PAN No" id="edit_panNo" error={errors.panNo} type="text" maxLength={10} {...field} />
                            )} />
                            <Controller name="aadharNo" control={control} render={({ field }) => (
                                <FormInput label={<>Aadhar No. <span style={{ color: '#ff3e1d' }}>*</span></>} id="edit_aadharNo" error={errors.aadharNo} type="text" maxLength={12} {...field} />
                            )} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <button type="submit" style={styles.btnPrimary}>Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// MAIN COMPONENT: ACCOUNT TAB
// ==========================================
const AccountTab = () => {
    const [profileImage, setProfileImage] = useState(DUMMY_AVATAR);
    const fileInputRef = useRef(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(accountSchema),
        mode: 'onChange',
        defaultValues: {
            joiningAmount: '0',
            walletBalance: '27000',
            fullName: '', sdwOf: '', dob: '', guardianContactNo: '',
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
        const stateName = data.state ? data.state.label : "";
        const districtName = data.district ? data.district.label : "";

        // --- FETCH USER DYNAMICALLY ON SUBMIT TO PREVENT NULL ISSUE ---
        const userStr = localStorage.getItem('loggedInUser');
        const loggedInUser = userStr ? JSON.parse(userStr) : null;
        const currentUserEmail = loggedInUser ? loggedInUser.email : "";

        const dbPayload = {
            ProfileImage: profileImage === DUMMY_AVATAR ? null : profileImage,
            PerName: data.fullName,
            GuardianName: data.sdwOf || "",
            DOB: data.dob,
            GuardianContactNo: data.guardianContactNo || "",
            StateName: stateName,
            DistName: districtName,
            City: data.city || "",
            BlockName: data.block || "",
            PO: data.postOffice || "",
            PS: data.policeStation || "",
            GramPanchayet: data.gramPanchayet || "",
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
            AprovalNumber: null,
            CreatedBy: currentUserEmail // Assign the correctly fetched email
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
                setProfileImage(DUMMY_AVATAR);
                setRefreshTrigger(prev => prev + 1);
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

    return (
        <>
            <ToastContainer autoClose={3000} pauseOnHover={false} />
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h5>Astha Didi Registration</h5>
                </div>
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
                        <h6 style={styles.sectionHeader}>Astha Didi Information <span style={{ color: '#ff3e1d', textTransform: 'none' }}>(Member ID : )</span></h6>
                        <div style={styles.formGrid}>
                            <Controller name="joiningAmount" control={control} render={({ field }) => (
                                <FormInput label={<>Joining Amount <span style={{ color: '#ff3e1d' }}>*</span></>} id="joiningAmount" error={errors.joiningAmount} placeholder="Enter Amount" type="number" readOnly disabled={true} {...field} />
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
                            <Controller name="guardianContactNo" control={control} render={({ field }) => (
                                <FormInput label="Guardian Contact no" id="guardianContactNo" error={errors.guardianContactNo} placeholder="Guardian Contact no" type="text" maxLength={50} {...field} />
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
                                    <Select {...field} options={districtOptions} styles={styles.selectStyles(!!errors.district)} placeholder="Select District" isDisabled={!selectedState} />
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

            {/* --- MEMBERS DATA TABLE --- */}
            <MembersTable refreshTrigger={refreshTrigger} />

        </>
    );
};

// ==========================================
// DATA TABLE COMPONENT (View, Delete, Approve, Pagination & Sorting)
// ==========================================
const MembersTable = ({ refreshTrigger }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');
    // userEmail state removed here to fix ESLint warning

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Sorting State
    const [sortConfig, setSortConfig] = useState(null);

    // Modal States
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [approveModal, setApproveModal] = useState(false);

    const [selectedRow, setSelectedRow] = useState(null);

    // Check localStorage for the logged-in user's role on component mount
    useEffect(() => {
        const userStr = localStorage.getItem('loggedInUser');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserRole(user.role || '');
                setUserName(user.username || '');
                // setUserEmail removed here as well
            } catch (e) {
                console.error("Error parsing user data");
            }
        }
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://my-dashboard-app-ky8v.onrender.com/RegInfo');
            let data = await res.json();

            // --- ADDED FILTER LOGIC FOR ASTHA DIDI ---
            const userStr = localStorage.getItem('loggedInUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role === 'Astha Didi') {
                    // Filter down to only rows strictly created by this specific Astha Didi's email
                    data = data.filter(member => member.CreatedBy === user.email);
                }
            }

            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [refreshTrigger]);

    // Sorting Logic
    const sortedMembers = React.useMemo(() => {
        let sortableItems = [...members];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (aVal === null || aVal === undefined) aVal = '';
                if (bVal === null || bVal === undefined) bVal = '';

                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();

                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [members, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnName) => {
        if (!sortConfig || sortConfig.key !== columnName) {
            return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
        }
        return sortConfig.direction === 'ascending' ? <span style={{ marginLeft: '4px' }}>▲</span> : <span style={{ marginLeft: '4px' }}>▼</span>;
    };

    // Pagination Logic
    const totalPages = Math.max(1, Math.ceil(sortedMembers.length / rowsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [sortedMembers.length, totalPages, currentPage]);

    const indexOfLastMember = currentPage * rowsPerPage;
    const indexOfFirstMember = indexOfLastMember - rowsPerPage;
    const currentMembers = sortedMembers.slice(indexOfFirstMember, indexOfLastMember);

    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleRowsChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Modal Actions
    const openModal = (type, member) => {
        setSelectedRow({ ...member });
        if (type === 'view') setViewModal(true);
        if (type === 'edit') setEditModal(true);
        if (type === 'delete') setDeleteModal(true);
        if (type === 'approve') setApproveModal(true);
    };

    const closeModal = () => {
        setViewModal(false); setEditModal(false); setDeleteModal(false); setApproveModal(false);
        setSelectedRow(null);
    };

    const confirmDelete = async () => {
        try {
            toast.loading("Deleting...", { toastId: 'delete' });
            const res = await fetch(`https://my-dashboard-app-ky8v.onrender.com/RegInfo/${selectedRow.RegInfoId}`, { method: 'DELETE' });
            toast.dismiss('delete');
            if (res.ok) {
                toast.success("Member deleted.");
                closeModal();
                fetchMembers();
            } else toast.error("Failed to delete.");
        } catch (error) { toast.dismiss('delete'); toast.error("Network error."); }
    };

    const confirmApprove = async () => {
        try {
            toast.loading("Approving...", { toastId: 'approve' });

            const approvalId = Math.floor(100000 + Math.random() * 900000);
            const dateStr = new Date().toISOString().split('T')[0];

            const approverString = userName && userRole ? `${userName} (${userRole})` : 'System Admin';

            const payload = { ...selectedRow, Status: 2, AprovalNumber: approvalId, AprovalDate: dateStr, AprovedBy: approverString };

            if (payload.DOB) {
                payload.DOB = payload.DOB.substring(0, 10);
            }

            const res = await fetch(`https://my-dashboard-app-ky8v.onrender.com/RegInfo/${selectedRow.RegInfoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            toast.dismiss('approve');
            if (res.ok) {
                toast.success(`Approved! ID: ${approvalId}`, { autoClose: false });
                closeModal();
                fetchMembers();
            } else toast.error("Failed to approve.");
        } catch (error) { toast.dismiss('approve'); toast.error("Network error."); }
    };

    const renderTh = (label, key, isStickyLeft = false, isStickyRight = false) => {
        let thStyle = { ...styles.th };
        if (isStickyLeft) thStyle = { ...styles.stickyLeftTh };
        if (isStickyRight) thStyle = { ...styles.stickyRightTh };

        return (
            <th style={thStyle} onClick={() => requestSort(key)}>
                {label} {getSortIcon(key)}
            </th>
        );
    };

    return (
        <div style={{ ...styles.card, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0 24px' }}>
                <h5 style={styles.cardHeader}>Your Registered Profile</h5>
                <button onClick={fetchMembers} style={styles.btnOutline}>Refresh Data</button>
            </div>

            <div style={styles.cardBody}>
                {loading ? <p>Loading data...</p> : (
                    <>
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        {/* STICKY LEFT HEADER */}
                                        {renderTh('ID', 'RegInfoId', true, false)}

                                        {/* SCROLLABLE MIDDLE HEADERS */}
                                        {renderTh('Profile Image', 'ProfileImage')}
                                        {renderTh('Approval ID', 'AprovalNumber')}
                                        {renderTh('Full Name', 'PerName')}
                                        {renderTh('Mobile No', 'ContactNo')}
                                        {renderTh('Email', 'MailId')}
                                        {/* UPDATED TABLE HEADERS */}
                                        {renderTh('State', 'StateName')}
                                        {renderTh('District', 'DistName')}
                                        {renderTh('Status', 'Status')}
                                        {renderTh('Approved By', 'AprovedBy')}
                                        {renderTh('DOB', 'DOB')}
                                        {renderTh('Aadhar', 'AadharNo')}
                                        {renderTh('PAN', 'PanNo')}
                                        {renderTh('City', 'City')}
                                        {renderTh('Gram Panchayet', 'GramPanchayet')}
                                        {renderTh('Joining Amt', 'JoiningAmt')}

                                        {/* STICKY RIGHT HEADER */}
                                        <th style={styles.stickyRightTh}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentMembers.map((row) => (
                                        <tr key={row.RegInfoId}>
                                            <td style={styles.stickyLeftTd}>#{row.RegInfoId}</td>
                                            <td style={styles.td}>
                                                <img src={row.ProfileImage || DUMMY_AVATAR} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                            </td>
                                            <td style={styles.td}>{row.AprovalNumber || 'Pending'}</td>
                                            <td style={styles.td}>{row.PerName}</td>
                                            <td style={styles.td}>{row.ContactNo}</td>
                                            <td style={styles.td}>{row.MailId}</td>
                                            <td style={styles.td}>{row.StateName}</td>
                                            <td style={styles.td}>{row.DistName}</td>
                                            <td style={{ ...styles.td, color: row.Status === 2 ? 'green' : 'orange', fontWeight: 'bold' }}>{row.Status === 2 ? 'Approved' : 'Pending'}</td>
                                            <td style={styles.td}>{row.AprovedBy || '-'}</td>
                                            <td style={styles.td}>{row.DOB ? row.DOB.substring(0, 10) : ''}</td>
                                            <td style={styles.td}>{row.AadharNo}</td>
                                            <td style={styles.td}>{row.PanNo}</td>
                                            <td style={styles.td}>{row.City || row.Village}</td>
                                            <td style={styles.td}>{row.GramPanchayet || '-'}</td>
                                            <td style={styles.td}>₹{row.JoiningAmt}</td>

                                            <td style={styles.stickyRightTd}>
                                                <button onClick={() => openModal('view', row)} style={styles.actionBtn} title="View">👁️</button>
                                                <button onClick={() => openModal('edit', row)} style={styles.actionBtn} title="Edit">✏️</button>

                                                {userRole !== 'Astha Didi' && (
                                                    <button onClick={() => openModal('delete', row)} style={styles.actionBtn} title="Delete">🗑️</button>
                                                )}

                                                {row.Status !== 2 && userRole !== 'Astha Didi' && (
                                                    <button onClick={() => openModal('approve', row)} style={styles.actionBtn} title="Approve">✅</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {currentMembers.length === 0 && <tr><td colSpan="17" style={{ ...styles.td, textAlign: 'center' }}>No members found in database.</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        {/* --- PAGINATION CONTROLS --- */}
                        <div style={styles.paginationContainer}>
                            <div>
                                <span>Rows per page: </span>
                                <select value={rowsPerPage} onChange={handleRowsChange} style={styles.pageSelect}>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div>
                                <span style={{ marginRight: '16px' }}>
                                    Showing {sortedMembers.length === 0 ? 0 : indexOfFirstMember + 1} to {Math.min(indexOfLastMember, sortedMembers.length)} of {sortedMembers.length}
                                </span>
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                                >
                                    Prev
                                </button>
                                <span style={{ margin: '0 12px' }}>Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    style={(currentPage === totalPages || totalPages === 0) ? styles.pageBtnDisabled : styles.pageBtn}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* VIEW MODAL */}
            {viewModal && selectedRow && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.modalContent, maxWidth: '1000px', padding: '0' }}>
                        <div style={styles.cardHeader}>
                            <h5 style={{ margin: 0 }}>View Member Details</h5>
                            <button style={styles.closeBtn} onClick={closeModal}>×</button>
                        </div>
                        <div style={styles.cardBody}>
                            <div style={styles.profileSection}>
                                <img src={selectedRow.ProfileImage || DUMMY_AVATAR} alt="Profile Avatar" style={styles.avatar} />
                                <div>
                                    <p style={styles.hintText}><strong>ID:</strong> #{selectedRow.RegInfoId}</p>
                                    <p style={styles.hintText}><strong>Approval No:</strong> {selectedRow.AprovalNumber || 'Pending'}</p>
                                    <p style={styles.hintText}><strong>Status:</strong> {selectedRow.Status === 2 ? 'Approved' : 'Pending'}</p>
                                    {selectedRow.Status === 2 && selectedRow.AprovedBy && (
                                        <p style={styles.hintText}><strong>Approved By:</strong> {selectedRow.AprovedBy}</p>
                                    )}
                                </div>
                            </div>

                            <h6 style={styles.sectionHeader}>Astha Didi Information</h6>
                            <div style={styles.formGrid}>
                                <FormInput label="Joining Amount" value={selectedRow.JoiningAmt || '0'} disabled readOnly />
                                <FormInput label="Wallet Balance" value={selectedRow.WalletBalance || '0'} disabled readOnly />
                            </div>

                            <h6 style={styles.sectionHeader}>Personal Details</h6>
                            <div style={styles.formGrid}>
                                <FormInput label="Full Name" value={selectedRow.PerName || ''} disabled readOnly />
                                <FormInput label="S/D/W of" value={selectedRow.GuardianName || ''} disabled readOnly />
                                <FormInput label="Date of Birth" value={selectedRow.DOB ? selectedRow.DOB.substring(0, 10) : ''} disabled readOnly />
                                <FormInput label="Guardian Contact no" value={selectedRow.GuardianContactNo || ''} disabled readOnly />
                            </div>

                            <h6 style={styles.sectionHeader}>Postal Address Information</h6>
                            <div style={styles.formGrid}>
                                <FormInput label="State" value={selectedRow.StateName || ''} disabled readOnly />
                                <FormInput label="District" value={selectedRow.DistName || ''} disabled readOnly />
                                <FormInput label="City" value={selectedRow.City || ''} disabled readOnly />
                                <FormInput label="Block" value={selectedRow.BlockName || ''} disabled readOnly />
                                <FormInput label="Post Office" value={selectedRow.PO || ''} disabled readOnly />
                                <FormInput label="Police Station" value={selectedRow.PS || ''} disabled readOnly />
                                <FormInput label="Gram Panchayet" value={selectedRow.GramPanchayet || ''} disabled readOnly />
                                <FormInput label="Village" value={selectedRow.Village || ''} disabled readOnly />
                                <FormInput label="Pin Code" value={selectedRow.Pincode || ''} disabled readOnly />
                                <FormInput label="Contact Number" value={selectedRow.ContactNo || ''} disabled readOnly />
                                <FormInput label="Email ID" value={selectedRow.MailId || ''} disabled readOnly />
                            </div>

                            <h6 style={styles.sectionHeader}>Banking & Payment Details</h6>
                            <div style={styles.formGrid}>
                                <FormInput label="Bank Name" value={selectedRow.BankName || ''} disabled readOnly />
                                <FormInput label="Branch Name" value={selectedRow.BranchName || ''} disabled readOnly />
                                <FormInput label="Account No" value={selectedRow.AcctNo || ''} disabled readOnly />
                                <FormInput label="IFS Code" value={selectedRow.IFSCode || ''} disabled readOnly />
                                <FormInput label="PAN No" value={selectedRow.PanNo || ''} disabled readOnly />
                                <FormInput label="Aadhar No" value={selectedRow.AadharNo || ''} disabled readOnly />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL WITH NEW COMPONENT */}
            {editModal && selectedRow && (
                <EditMemberModal
                    member={selectedRow}
                    onClose={closeModal}
                    onSuccess={() => { closeModal(); fetchMembers(); }}
                />
            )}

            {/* DELETE MODAL */}
            {deleteModal && selectedRow && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.modalContent, maxWidth: '400px', textAlign: 'center' }}>
                        <h4 style={{ marginTop: 0, color: '#ff3e1d' }}>Confirm Delete</h4>
                        <p>Are you sure you want to completely delete <strong>{selectedRow.PerName}</strong>? This action cannot be undone.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                            <button onClick={closeModal} style={styles.btnOutline}>Cancel</button>
                            <button onClick={confirmDelete} style={styles.btnDanger}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* APPROVE MODAL */}
            {approveModal && selectedRow && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.modalContent, maxWidth: '400px', textAlign: 'center' }}>
                        <h4 style={{ marginTop: 0, color: '#71dd37' }}>Approve Member</h4>
                        <p>Are you sure you want to approve <strong>{selectedRow.PerName}</strong>?</p>
                        <p style={{ fontSize: '0.85rem', color: '#a1acb8' }}>This will generate a permanent 6-digit Approval ID.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                            <button onClick={closeModal} style={styles.btnOutline}>Cancel</button>
                            <button onClick={confirmApprove} style={styles.btnSuccess}>Confirm Approval</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountTab;