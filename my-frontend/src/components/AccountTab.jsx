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
    btnSuccess: { backgroundColor: '#71dd37', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    hintText: { color: '#a1acb8', fontSize: '0.8125rem', margin: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
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

    // UPDATED Table Styles to FORCE the scrollbar to show
    tableContainer: { width: '100%', maxWidth: '100%', overflowX: 'scroll', display: 'block', marginTop: '20px', WebkitOverflowScrolling: 'touch', paddingBottom: '10px' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '1500px' },
    th: { padding: '12px 16px', textAlign: 'left', backgroundColor: '#f5f5f9', color: '#566a7f', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #d9dee3', whiteSpace: 'nowrap' },
    td: { padding: '12px 16px', borderBottom: '1px solid #d9dee3', color: '#697a8d', fontSize: '0.9375rem', whiteSpace: 'nowrap' },

    // Sticky Column Styles
    stickyLeftTh: { position: 'sticky', left: 0, zIndex: 2, padding: '12px 16px', textAlign: 'left', backgroundColor: '#f5f5f9', color: '#566a7f', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #d9dee3', whiteSpace: 'nowrap', borderRight: '1px solid #d9dee3' },
    stickyLeftTd: { position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#ffffff', padding: '12px 16px', borderBottom: '1px solid #d9dee3', color: '#697a8d', fontSize: '0.9375rem', whiteSpace: 'nowrap', borderRight: '1px solid #d9dee3' },
    stickyRightTh: { position: 'sticky', right: 0, zIndex: 2, padding: '12px 16px', textAlign: 'left', backgroundColor: '#f5f5f9', color: '#566a7f', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #d9dee3', whiteSpace: 'nowrap', borderLeft: '1px solid #d9dee3' },
    stickyRightTd: { position: 'sticky', right: 0, zIndex: 1, backgroundColor: '#ffffff', padding: '12px 16px', borderBottom: '1px solid #d9dee3', color: '#697a8d', fontSize: '0.9375rem', whiteSpace: 'nowrap', borderLeft: '1px solid #d9dee3' },

    actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', margin: '0 4px', color: '#697a8d' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
    closeBtn: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a1acb8' }
};

const FormInput = ({ label, id, error, placeholder, disabled, ...props }) => (
    <div style={styles.inputGroup}>
        <label htmlFor={id} style={styles.label}>{label}</label>
        <input id={id} style={disabled ? styles.inputDisabled : styles.input(!!error)} placeholder={placeholder} disabled={disabled} {...props} />
        {error && <p style={styles.errorText}>{error.message}</p>}
    </div>
);

// ==========================================
// MAIN COMPONENT: ACCOUNT TAB
// ==========================================
const AccountTab = () => {
    const [profileImage, setProfileImage] = useState(DUMMY_AVATAR);
    const fileInputRef = useRef(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        const dbPayload = {
            ProfileImage: profileImage === DUMMY_AVATAR ? null : profileImage,
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
                                <FormInput label={<>Joining Amount <span style={{ color: '#ff3e1d' }}>*</span></>} id="joiningAmount" error={errors.joiningAmount} placeholder="Enter Amount" type="number" {...field} />
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

// ==========================================
// DATA TABLE COMPONENT (View, Edit, Delete, Approve)
// ==========================================
const MembersTable = ({ refreshTrigger }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [approveModal, setApproveModal] = useState(false);

    const [selectedRow, setSelectedRow] = useState(null);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://my-dashboard-app-ky8v.onrender.com/RegInfo');
            const data = await res.json();
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

    const openModal = (type, member) => {
        setSelectedRow({ ...member }); // Clone the object
        if (type === 'view') setViewModal(true);
        if (type === 'edit') setEditModal(true);
        if (type === 'delete') setDeleteModal(true);
        if (type === 'approve') setApproveModal(true);
    };

    const closeModal = () => {
        setViewModal(false); setEditModal(false); setDeleteModal(false); setApproveModal(false);
        setSelectedRow(null);
    };

    const handleEditChange = (e) => {
        setSelectedRow({ ...selectedRow, [e.target.name]: e.target.value });
    };

    const submitEdit = async () => {
        try {
            toast.loading("Updating member...", { toastId: 'update' });
            const res = await fetch(`https://my-dashboard-app-ky8v.onrender.com/RegInfo/${selectedRow.RegInfoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedRow)
            });
            toast.dismiss('update');
            if (res.ok) {
                toast.success("Member updated successfully!");
                closeModal();
                fetchMembers();
            } else toast.error("Failed to update.");
        } catch (error) { toast.dismiss('update'); toast.error("Network error."); }
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
            const approvalId = Math.floor(100000000000 + Math.random() * 900000000000);
            const dateStr = new Date().toISOString().split('T')[0];

            const payload = { ...selectedRow, Status: 2, AprovalNumber: approvalId, AprovalDate: dateStr };

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

    return (
        // ADDED OVERFLOW: HIDDEN to the outer card to stop the page from stretching!
        <div style={{ ...styles.card, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0 24px' }}>
                <h5 style={styles.cardHeader}>Registered Members List</h5>
                <button onClick={fetchMembers} style={styles.btnOutline}>Refresh Data</button>
            </div>

            <div style={styles.cardBody}>
                {loading ? <p>Loading data...</p> : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {/* STICKY LEFT HEADER */}
                                    <th style={styles.stickyLeftTh}>ID</th>

                                    {/* SCROLLABLE MIDDLE HEADERS */}
                                    <th style={styles.th}>Profile Image</th>
                                    <th style={styles.th}>Approval ID</th>
                                    <th style={styles.th}>Full Name</th>
                                    <th style={styles.th}>Mobile No</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>DOB</th>
                                    <th style={styles.th}>Aadhar</th>
                                    <th style={styles.th}>PAN</th>
                                    <th style={styles.th}>City</th>
                                    <th style={styles.th}>Joining Amt</th>

                                    {/* STICKY RIGHT HEADER */}
                                    <th style={styles.stickyRightTh}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((row) => (
                                    <tr key={row.RegInfoId}>
                                        {/* STICKY LEFT DATA */}
                                        <td style={styles.stickyLeftTd}>#{row.RegInfoId}</td>

                                        {/* SCROLLABLE MIDDLE DATA */}
                                        <td style={styles.td}>
                                            <img src={row.ProfileImage || DUMMY_AVATAR} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                        </td>
                                        <td style={styles.td}>{row.AprovalNumber || 'Pending'}</td>
                                        <td style={styles.td}>{row.PerName}</td>
                                        <td style={styles.td}>{row.ContactNo}</td>
                                        <td style={styles.td}>{row.MailId}</td>
                                        <td style={{ ...styles.td, color: row.Status === 2 ? 'green' : 'orange', fontWeight: 'bold' }}>{row.Status === 2 ? 'Approved' : 'Pending'}</td>
                                        <td style={styles.td}>{row.DOB ? row.DOB.substring(0, 10) : ''}</td>
                                        <td style={styles.td}>{row.AadharNo}</td>
                                        <td style={styles.td}>{row.PanNo}</td>
                                        <td style={styles.td}>{row.City || row.Village}</td>
                                        <td style={styles.td}>₹{row.JoiningAmt}</td>

                                        {/* STICKY RIGHT DATA */}
                                        <td style={styles.stickyRightTd}>
                                            <button onClick={() => openModal('view', row)} style={styles.actionBtn} title="View">👁️</button>
                                            <button onClick={() => openModal('edit', row)} style={styles.actionBtn} title="Edit">✏️</button>
                                            <button onClick={() => openModal('delete', row)} style={styles.actionBtn} title="Delete">🗑️</button>
                                            {row.Status !== 2 && (
                                                <button onClick={() => openModal('approve', row)} style={styles.actionBtn} title="Approve">✅</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {members.length === 0 && <tr><td colSpan="13" style={{ ...styles.td, textAlign: 'center' }}>No members found in database.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* VIEW MODAL */}
            {viewModal && selectedRow && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <button style={styles.closeBtn} onClick={closeModal}>×</button>
                        <h4 style={{ marginTop: 0 }}>View Member Details</h4>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <img src={selectedRow.ProfileImage || DUMMY_AVATAR} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div>
                                <p><strong>Name:</strong> {selectedRow.PerName}</p>
                                <p><strong>ID:</strong> #{selectedRow.RegInfoId} | <strong>Approval No:</strong> {selectedRow.AprovalNumber || 'Pending'}</p>
                                <p><strong>Status:</strong> {selectedRow.Status === 2 ? 'Approved' : 'Pending'}</p>
                            </div>
                        </div>
                        <div style={styles.formGrid}>
                            <p><strong>Mobile:</strong> {selectedRow.ContactNo}</p>
                            <p><strong>Email:</strong> {selectedRow.MailId}</p>
                            <p><strong>DOB:</strong> {selectedRow.DOB ? selectedRow.DOB.substring(0, 10) : ''}</p>
                            <p><strong>Aadhar:</strong> {selectedRow.AadharNo}</p>
                            <p><strong>Village:</strong> {selectedRow.Village}</p>
                            <p><strong>Pin Code:</strong> {selectedRow.Pincode}</p>
                            <p><strong>Joining Amount:</strong> ₹{selectedRow.JoiningAmt}</p>
                            <p><strong>Bank Name:</strong> {selectedRow.BankName}</p>
                            <p><strong>Account No:</strong> {selectedRow.AcctNo}</p>
                            <p><strong>IFSC:</strong> {selectedRow.IFSCode}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editModal && selectedRow && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <button style={styles.closeBtn} onClick={closeModal}>×</button>
                        <h4 style={{ marginTop: 0 }}>Edit Member Details</h4>
                        <div style={styles.formGrid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input style={styles.input(false)} name="PerName" value={selectedRow.PerName || ''} onChange={handleEditChange} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Mobile No</label>
                                <input style={styles.input(false)} name="ContactNo" value={selectedRow.ContactNo || ''} onChange={handleEditChange} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Email</label>
                                <input style={styles.input(false)} name="MailId" value={selectedRow.MailId || ''} onChange={handleEditChange} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Aadhar No</label>
                                <input style={styles.input(false)} name="AadharNo" value={selectedRow.AadharNo || ''} onChange={handleEditChange} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Village</label>
                                <input style={styles.input(false)} name="Village" value={selectedRow.Village || ''} onChange={handleEditChange} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Pin Code</label>
                                <input style={styles.input(false)} name="Pincode" value={selectedRow.Pincode || ''} onChange={handleEditChange} />
                            </div>
                        </div>
                        <button onClick={submitEdit} style={styles.btnPrimary}>Save Changes</button>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteModal && selectedRow && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.modalContent, maxWidth: '400px', textAlign: 'center' }}>
                        <h4 style={{ marginTop: 0, color: '#ff3e1d' }}>Confirm Delete</h4>
                        <p>Are you sure you want to completely delete <strong>{selectedRow.PerName}</strong>? This action cannot be undone.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
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
                        <p style={{ fontSize: '0.85rem', color: '#a1acb8' }}>This will generate a permanent 12-digit Approval ID.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
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