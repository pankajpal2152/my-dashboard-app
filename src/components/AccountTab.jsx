// src/components/AccountTab.jsx
import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import { State } from 'country-state-city';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- 1. DATA & CONFIGURATION ---

// Dummy Initial Avatar
const DUMMY_AVATAR = "https://api.dicebear.com/8.x/initials/svg?seed=Rajesh&backgroundColor=696cff";

// Regex Patterns for Indian Validation
const indianZipRegex = /^[1-9][0-9]{5}$/; // 6 digits, cannot start with 0
const indianPhoneRegex = /^(?:\+91[\s]?|91[\s]?)?[6789]\d{9}$/; // Standard Indian Mobile pattern (added optional space)

// Zod Validation Schema (Added max lengths to match HTML inputs)
const accountSchema = z.object({
    firstName: z.string().min(2, "Min 2 characters").max(50, "Max 50 characters").regex(/^[a-zA-Z\s]+$/, "Letters only"),
    lastName: z.string().min(1, "Required").max(50, "Max 50 characters").regex(/^[a-zA-Z\s]+$/, "Letters only"),
    email: z.string().email("Please enter a valid email address").max(100, "Max 100 characters"),
    organization: z.string().min(2, "Organization name is required").max(100, "Max 100 characters"),
    phoneNumber: z.string().regex(indianPhoneRegex, "Valid Indian phone required (e.g., +91 9876543210)"),
    address: z.string().min(5, "Address is required").max(200, "Max 200 characters"),
    zipCode: z.string().regex(indianZipRegex, "Valid 6-digit Pincode required (e.g., 560001)").length(6, "Must be exactly 6 digits"),
    state: z.object({ value: z.string(), label: z.string() }).nullable().refine(val => val !== null, "State is required"),
    language: z.object({ value: z.string(), label: z.string() }).nullable().refine(val => val !== null, "Language is required"),
    deactivateConfirm: z.boolean().optional()
});

// Dynamic Data Fetching
const indianStates = State.getStatesOfCountry('IN').map(state => ({ value: state.isoCode, label: state.name }));

// Curated list of Indian Languages for react-select
const indianLanguages = [
    { value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi (हिन्दी)' },
    { value: 'bn', label: 'Bengali (বাংলা)' }, { value: 'te', label: 'Telugu (తెలుగు)' },
    { value: 'mr', label: 'Marathi (మరాఠీ)' }, { value: 'ta', label: 'Tamil (தமிழ்)' },
    { value: 'ur', label: 'Urdu (اردو)' }, { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
    { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' }, { value: 'ml', label: 'Malayalam (മലയാളം)' },
    { value: 'or', label: 'Odia (ଓଡ଼ିଆ)' }, { value: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' }
];

// --- 2. STYLES ---
const styles = {
    card: { backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px 0 rgba(67, 89, 113, 0.12)', fontFamily: '"Public Sans", sans-serif', overflow: 'visible', marginBottom: '24px' },
    cardHeader: { padding: '24px', borderBottom: '1px solid #d9dee3', fontSize: '1.125rem', fontWeight: '500', color: '#566a7f', margin: 0 },
    cardBody: { padding: '24px' },
    profileSection: { display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' },
    avatar: { width: '100px', height: '100px', borderRadius: '6px', objectFit: 'cover' },
    buttonGroup: { display: 'flex', gap: '16px', marginBottom: '12px', marginTop: '10px' },
    btnPrimary: { backgroundColor: '#696cff', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    btnOutline: { backgroundColor: 'transparent', color: '#697a8d', border: '1px solid #d9dee3', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    btnDanger: { backgroundColor: '#ff3e1d', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    hintText: { color: '#a1acb8', fontSize: '0.8125rem', margin: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.75rem', fontWeight: '600', color: '#566a7f', textTransform: 'uppercase', letterSpacing: '0.25px' },
    input: (hasError) => ({ padding: '10px 14px', borderRadius: '6px', border: hasError ? '1px solid #ff3e1d' : '1px solid #d9dee3', fontSize: '0.9375rem', color: '#697a8d', outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit' }),
    inputDisabled: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #d9dee3', fontSize: '0.9375rem', color: '#a1acb8', outline: 'none', backgroundColor: '#f5f5f9', cursor: 'not-allowed', fontFamily: 'inherit' },
    errorText: { color: '#ff3e1d', fontSize: '0.75rem', margin: 0, marginTop: '-4px' },
    selectStyles: (hasError) => ({
        control: (base) => ({ ...base, borderColor: hasError ? '#ff3e1d' : '#d9dee3', minHeight: '42px', borderRadius: '6px', boxShadow: 'none', '&:hover': { borderColor: '#696cff' } }),
        singleValue: (base) => ({ ...base, color: '#697a8d', fontSize: '0.9375rem' }),
        placeholder: (base) => ({ ...base, color: '#b4bdc6', fontSize: '0.9375rem' }),
        menu: (base) => ({ ...base, zIndex: 9999 })
    }),
    warningBox: { backgroundColor: 'rgba(255, 171, 0, 0.16)', padding: '16px', borderRadius: '6px', marginBottom: '16px' },
    warningTitle: { color: '#ffab00', fontSize: '0.9375rem', fontWeight: '600', margin: '0 0 4px 0' },
    warningText: { color: '#ffab00', fontSize: '0.875rem', margin: 0 }
};

// Custom Input Component to keep code clean
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

    const { control, handleSubmit, reset, register, formState: { errors, isDirty } } = useForm({
        resolver: zodResolver(accountSchema),
        mode: 'onChange', // FIX: Added this to enable real-time live validation
        defaultValues: {
            firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@example.in', organization: 'ThemeSelection',
            phoneNumber: '+91 9876543210', address: '123, MG Road, Indira Nagar',
            state: null, zipCode: '560038', language: null, deactivateConfirm: false
        }
    });

    // --- Image Handling ---
    const handleUploadClick = () => fileInputRef.current.click();
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 800000) { // 800KB limit
                toast.warning("Image size exceeds 800K. Please upload a smaller file.", { position: "top-center" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                toast.success("Profile picture updated locally.", { position: "top-right" });
            };
            reader.readAsDataURL(file);
        }
    };
    const handleResetImage = () => {
        setProfileImage(DUMMY_AVATAR);
        fileInputRef.current.value = "";
        toast.info("Profile picture reset.", { position: "top-right" });
    };

    // --- Form Submission ---
    const onSubmit = (data) => {
        console.log("Saving Data to Backend:", data);
        toast.success("Success: Profile details updated successfully!", { position: "top-right" });
    };

    const onError = () => {
        toast.error("Error: Please check the red fields in the form.", { position: "top-right" });
    };

    const onDeactivate = (data) => {
        if (!data.deactivateConfirm) {
            toast.warning("Please confirm account deactivation by checking the box.", { position: "top-center" });
            return;
        }
        toast.error("Account Deactivated successfully. Logging out...", { position: "top-center" });
    };

    return (
        <>
            <ToastContainer autoClose={3000} pauseOnHover={false} />

            {/* --- TOP CARD: PROFILE DETAILS --- */}
            <div style={styles.card}>
                <h5 style={styles.cardHeader}>Profile Details</h5>
                <div style={styles.cardBody}>
                    <div style={styles.profileSection}>
                        <img src={profileImage} alt="Profile Avatar" style={styles.avatar} />
                        <div>
                            <div style={styles.buttonGroup}>
                                <button style={styles.btnPrimary} onClick={handleUploadClick}>Upload new photo</button>
                                <button style={styles.btnOutline} onClick={handleResetImage}>Reset</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" style={{ display: 'none' }} />
                            </div>
                            <p style={styles.hintText}>Allowed JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                    </div>

                    <hr style={{ border: '0', borderTop: '1px solid #d9dee3', margin: '0 -24px 24px -24px' }} />

                    <form onSubmit={handleSubmit(onSubmit, onError)}>
                        <div style={styles.formGrid}>
                            <Controller name="firstName" control={control} render={({ field }) => (
                                // FIX: Added type and maxLength
                                <FormInput label="First Name" id="firstName" error={errors.firstName} placeholder="e.g., Rajesh" type="text" maxLength={50} />
                            )} />
                            <Controller name="lastName" control={control} render={({ field }) => (
                                // FIX: Added type and maxLength
                                <FormInput label="Last Name" id="lastName" error={errors.lastName} placeholder="e.g., Sharma" type="text" maxLength={50} />
                            )} />
                            <Controller name="email" control={control} render={({ field }) => (
                                // FIX: Added type email and maxLength
                                <FormInput label="E-mail" id="email" error={errors.email} placeholder="e.g., user@example.in" type="email" maxLength={100} />
                            )} />
                            <Controller name="organization" control={control} render={({ field }) => (
                                // FIX: Added type and maxLength
                                <FormInput label="Organization" id="organization" error={errors.organization} placeholder="e.g., Tata Consultancy" type="text" maxLength={100} />
                            )} />
                            <Controller name="phoneNumber" control={control} render={({ field }) => (
                                // FIX: Added type tel and maxLength (15 to accommodate country code and spaces)
                                <FormInput label="Phone Number" id="phoneNumber" error={errors.phoneNumber} placeholder="e.g., +91 9876543210" type="tel" maxLength={13} />
                            )} />
                            <Controller name="address" control={control} render={({ field }) => (
                                // FIX: Added type and maxLength
                                <FormInput label="Address" id="address" error={errors.address} placeholder="e.g., 123, MG Road" type="text" maxLength={200} />
                            )} />

                            {/* Dynamic State Dropdown from country-state-city library */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>State</label>
                                <Controller name="state" control={control} render={({ field }) => (
                                    <Select {...field} options={indianStates} styles={styles.selectStyles(!!errors.state)} placeholder="Select State..." />
                                )} />
                                {errors.state && <p style={styles.errorText}>{errors.state.message}</p>}
                            </div>

                            <Controller name="zipCode" control={control} render={({ field }) => (
                                // FIX: Added type text and strict 6 digit limit 
                                <FormInput label="Pin Code" id="zipCode" error={errors.zipCode} placeholder="e.g., 560001" type="text" maxLength={6} />
                            )} />

                            {/* Fixed Read-Only Fields */}
                            <FormInput label="Country" id="country" disabled={true} value="India" />

                            {/* Language Dropdown */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Language</label>
                                <Controller name="language" control={control} render={({ field }) => (
                                    <Select {...field} options={indianLanguages} styles={styles.selectStyles(!!errors.language)} placeholder="Select Language..." />
                                )} />
                                {errors.language && <p style={styles.errorText}>{errors.language.message}</p>}
                            </div>

                            {/* Fixed Read-Only Fields */}
                            <FormInput label="Timezone" id="timezone" disabled={true} value="(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi" />
                            <FormInput label="Currency" id="currency" disabled={true} value="INR (₹) - Indian Rupee" />
                        </div>

                        <div style={styles.formFooter}>
                            <button type="submit" style={styles.btnPrimary}>Save changes</button>
                            <button type="button" style={styles.btnOutline} onClick={() => { reset(); toast.info("Changes canceled."); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- BOTTOM CARD: DELETE ACCOUNT --- */}
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