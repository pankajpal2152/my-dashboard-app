// src/pages/AccountPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import TimezoneSelect from 'react-timezone-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- DATA & CONFIGURATION ---

// 1. DUMMY INITIAL IMAGE
const DUMMY_AVATAR = "https://api.dicebear.com/8.x/initials/svg?seed=Rajesh&backgroundColor=00897b,00acc1,039be5&backgroundType=gradientLinear";

// 2. VALIDATION SCHEMA (Zod + Regex) - Tailored for Indian Conventions
const indianZipRegex = /^[1-9][0-9]{5}$/; // 6 digits, doesn't start with 0
const indianPhoneRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/; // Standard Indian Mobile

const accountSchema = z.object({
    firstName: z.string()
        .min(2, "First Name must be at least 2 characters")
        .regex(/^[a-zA-Z\s]+$/, "First Name must only contain letters and spaces"),
    lastName: z.string()
        .min(1, "Last Name is required")
        .regex(/^[a-zA-Z\s]+$/, "Last Name must only contain letters and spaces"),
    email: z.string()
        .email("Please enter a valid email address (e.g., user@example.in)"),
    organization: z.string()
        .min(2, "Organization name is too short")
        .regex(/^[a-zA-Z0-9\s,\.-]+$/, "Invalid characters in organization name"),
    phoneNumber: z.string()
        .regex(indianPhoneRegex, "Invalid Indian phone number (e.g., +91 98765 43210)"),
    address: z.string()
        .min(5, "Address must be at least 5 characters"),
    state: z.string()
        .min(2, "State is required"),
    zipCode: z.string()
        .regex(indianZipRegex, "Invalid Indian Pincode (must be 6 digits, e.g., 560001)"),
    country: z.object({ value: z.string(), label: z.string() }),
    language: z.object({ value: z.string(), label: z.string() }),
    timezone: z.any(), // TimezoneSelect returns complex object
    currency: z.object({ value: z.string(), label: z.string() }),
});

// 3. DROPDOWN DATA (Indian focused)
const countries = [{ value: 'IN', label: 'India' }];
const languages = [
    { value: 'en_IN', label: 'English (India)' },
    { value: 'hi_IN', label: 'Hindi (हिन्दी)' },
    { value: 'bn_IN', label: 'Bengali (বাংলা)' },
];
const currencies = [
    { value: 'INR', label: 'INR (₹) - Indian Rupee' },
    { value: 'USD', label: 'USD ($) - US Dollar' },
];

// --- STYLES ---
const styles = {
    container: { padding: '24px', fontFamily: '"Public Sans", sans-serif', color: '#566a7f', backgroundColor: '#f5f5f9', minHeight: '100vh' },
    breadcrumb: { fontSize: '1.25rem', color: '#a1acb8', margin: '0 0 10px 0', fontWeight: '400' },
    breadcrumbActive: { fontWeight: '600', color: '#566a7f' },
    tabsContainer: { display: 'flex', gap: '8px', marginBottom: '24px' },
    tab: (isActive) => ({ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '6px', backgroundColor: isActive ? '#696cff' : 'transparent', color: isActive ? '#ffffff' : '#697a8d', fontWeight: '500', border: 'none', cursor: 'pointer' }),
    card: { backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px 0 rgba(67, 89, 113, 0.12)', overflow: 'hidden', marginBottom: '24px' },
    cardHeader: { padding: '24px', borderBottom: '1px solid #d9dee3', fontSize: '1.125rem', fontWeight: '500', color: '#566a7f', margin: 0 },
    cardBody: { padding: '24px' },
    profileSection: { display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' },
    avatar: { width: '100px', height: '100px', borderRadius: '6px', objectFit: 'cover' },
    buttonGroup: { display: 'flex', gap: '16px', marginBottom: '12px', marginTop: '10px' },
    btnPrimary: { backgroundColor: '#696cff', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer' },
    btnOutline: { backgroundColor: 'transparent', color: '#697a8d', border: '1px solid #d9dee3', borderRadius: '6px', padding: '8px 20px', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer' },
    hintText: { color: '#a1acb8', fontSize: '0.8125rem', margin: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(calc(50% - 12px), 1fr))', gap: '24px', marginBottom: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.75rem', fontWeight: '600', color: '#566a7f', textTransform: 'uppercase', letterSpacing: '0.25px' },
    input: (hasError) => ({ padding: '10px 14px', borderRadius: '6px', border: hasError ? '1px solid #ff3e1d' : '1px solid #d9dee3', fontSize: '0.9375rem', color: '#697a8d', outline: 'none' }),
    errorText: { color: '#ff3e1d', fontSize: '0.75rem', margin: 0, marginTop: '-4px' },
    selectStyles: (hasError) => ({
        control: (base) => ({ ...base, borderColor: hasError ? '#ff3e1d' : '#d9dee3', minHeight: '42px', borderRadius: '6px' }),
        singleValue: (base) => ({ ...base, color: '#697a8d', fontSize: '0.9375rem' }),
        placeholder: (base) => ({ ...base, color: '#b4bdc6', fontSize: '0.9375rem' }),
    })
};

// --- HELPER COMPONENT: FORM INPUT ---
const FormInput = ({ label, id, error, placeholder, ...props }) => (
    <div style={styles.inputGroup}>
        <label htmlFor={id} style={styles.label}>{label}</label>
        <input id={id} style={styles.input(!!error)} placeholder={placeholder} {...props} />
        {error && <p style={styles.errorText}>{error.message}</p>}
    </div>
);

// --- MAIN COMPONENT ---
const AccountPage = () => {
    // 1. Image State
    const [profileImage, setProfileImage] = useState(DUMMY_AVATAR);
    const fileInputRef = useRef(null);

    // 2. React Hook Form with Zod Resolver
    const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            firstName: '', lastName: '', email: '', organization: '',
            phoneNumber: '', address: '', state: '', zipCode: '',
            country: countries[0], language: languages[0],
            timezone: { value: 'Asia/Kolkata', label: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
            currency: currencies[0],
        }
    });

    // 3. Image Event Handlers
    const handleUploadClick = () => fileInputRef.current.click();
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 800000) {
                toast.warning("Warning: Image size exceeds 800K. Please upload a smaller file.", { position: "top-center" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);
        }
    };
    const handleResetImage = () => {
        setProfileImage(DUMMY_AVATAR);
        fileInputRef.current.value = ""; // Clear file input
        toast.info("Profile picture reset to default.", { position: "top-center", autoClose: 2000 });
    };

    // 4. Form Submit Handler (Backend Ready structure)
    const onSubmit = (data) => {
        // Structure final data object (ready for API call)
        const finalData = {
            ...data,
            profileImage: profileImage === DUMMY_AVATAR ? null : profileImage, // Send NULL if default
            timezone: data.timezone.value, // Extract simple value
        };

        console.log("Form Data Submitted:", finalData);

        // Simulate Backend response
        toast.loading("Saving changes...", { toastId: 'saving' });
        setTimeout(() => {
            toast.dismiss('saving');
            toast.success("Success: Profile details updated successfully!", { position: "top-right" });
        }, 1500);
    };

    // 5. Submit Error Handler (Toasts Warning)
    const onError = () => {
        if (!isDirty) {
            toast.warning("No changes detected. Please update fields before saving.", { position: "top-center" });
        } else {
            toast.error("Error: Please correct the red-marked fields in the form.", { position: "top-right" });
        }
    };

    return (
        <div style={styles.container}>
            <ToastContainer autoClose={3000} pauseOnHover={false} />

            {/* Page Title */}
            <h4 style={styles.breadcrumb}>
                Account Settings / <span style={styles.breadcrumbActive}>Account</span>
            </h4>

            {/* Tabs */}
            <div style={styles.tabsContainer}>
                <button style={styles.tab(true)}>👤 Account</button>
                <button style={styles.tab(false)}>🔔 Notifications</button>
                <button style={styles.tab(false)}>🔗 Connections</button>
            </div>

            <div style={styles.card}>
                <h5 style={styles.cardHeader}>Profile Details</h5>

                <div style={styles.cardBody}>
                    {/* A. Profile Upload Section */}
                    <div style={styles.profileSection}>
                        <img src={profileImage} alt="Profile" style={styles.avatar} />
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

                    {/* B. Form Grid */}
                    <form onSubmit={handleSubmit(onSubmit, onError)}>
                        <div style={styles.formGrid}>

                            {/* Standard Inputs with Indian Examples */}
                            <Controller name="firstName" control={control} render={({ field }) => (
                                <FormInput label="First Name" id="firstName" error={errors.firstName} placeholder="e.g., Rajesh" {...field} />
                            )} />

                            <Controller name="lastName" control={control} render={({ field }) => (
                                <FormInput label="Last Name" id="lastName" error={errors.lastName} placeholder="e.g., Sharma" {...field} />
                            )} />

                            <Controller name="email" control={control} render={({ field }) => (
                                <FormInput label="E-mail" id="email" error={errors.email} placeholder="e.g., rajesh.sharma@example.in" {...field} />
                            )} />

                            <Controller name="organization" control={control} render={({ field }) => (
                                <FormInput label="Organization" id="organization" error={errors.organization} placeholder="e.g., Infosys Pvt Ltd" {...field} />
                            )} />

                            <Controller name="phoneNumber" control={control} render={({ field }) => (
                                <FormInput label="Phone Number" id="phoneNumber" error={errors.phoneNumber} placeholder="e.g., +91 9876543210" {...field} />
                            )} />

                            <Controller name="address" control={control} render={({ field }) => (
                                <FormInput label="Address" id="address" error={errors.address} placeholder="e.g., 123, MG Road, Indira Nagar" {...field} />
                            )} />

                            <Controller name="state" control={control} render={({ field }) => (
                                <FormInput label="State" id="state" error={errors.state} placeholder="e.g., Karnataka" {...field} />
                            )} />

                            <Controller name="zipCode" control={control} render={({ field }) => (
                                <FormInput label="Zip Code" id="zipCode" error={errors.zipCode} placeholder="e.g., 560038 (6 Digits)" {...field} />
                            )} />

                            {/* Specialized Dropdowns */}

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Country</label>
                                <Controller name="country" control={control} render={({ field }) => (
                                    <Select options={countries} styles={styles.selectStyles(!!errors.country)} isDisabled={true} {...field} />
                                )} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Language</label>
                                <Controller name="language" control={control} render={({ field }) => (
                                    <Select options={languages} styles={styles.selectStyles(!!errors.language)} placeholder="Select Language..." {...field} />
                                )} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Timezone</label>
                                <Controller name="timezone" control={control} render={({ field }) => (
                                    <TimezoneSelect styles={styles.selectStyles(!!errors.timezone)} {...field} />
                                )} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Currency</label>
                                <Controller name="currency" control={control} render={({ field }) => (
                                    <Select options={currencies} styles={styles.selectStyles(!!errors.currency)} {...field} />
                                )} />
                            </div>

                        </div>

                        {/* Form Footer Buttons */}
                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                            <button type="submit" style={styles.btnPrimary}>Save changes</button>
                            <button type="button" style={styles.btnOutline} onClick={() => reset()}>Cancel Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;