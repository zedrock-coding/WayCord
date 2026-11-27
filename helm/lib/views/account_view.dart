import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/navigation_provider.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/user_avatar.dart';
import '../widgets/feedback_dialog.dart';

class AccountView extends StatefulWidget {
  final VoidCallback onBackToToday;

  const AccountView({super.key, required this.onBackToToday});

  @override
  State<AccountView> createState() => _AccountViewState();
}

class _AccountViewState extends State<AccountView> {
  final _supabase = Supabase.instance.client;
  final _supabaseService = SupabaseService();
  final _displayNameController = TextEditingController();

  String? _avatarUrl;
  bool _isSavingName = false;
  bool _isUploadingPhoto = false;
  bool _isSigningOut = false;
  late Future<List<Map<String, dynamic>>> _communitiesFuture;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _communitiesFuture = _supabaseService.fetchUserCommunities();
  }

  void _loadUserData() {
    final user = _supabase.auth.currentUser;
    if (user != null) {
      _displayNameController.text =
          (user.userMetadata?['full_name'] as String?) ?? '';
      _avatarUrl = user.userMetadata?['avatar_url'] as String?;
    }
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    super.dispose();
  }

  Future<void> _pickAndUploadPhoto() async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 70,
    );

    if (image == null) return;

    setState(() => _isUploadingPhoto = true);
    try {
      final bytes = await image.readAsBytes();
      const String fileName = 'profile.jpg';
      final String? newUrl = await _supabaseService.uploadAvatar(bytes, fileName);

      if (newUrl != null && mounted) {
        setState(() {
          _avatarUrl = newUrl;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile picture updated successfully')),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update avatar photo'),
            backgroundColor: AppTheme.priorityUrgent,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload failed: $e'),
            backgroundColor: AppTheme.priorityUrgent,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isUploadingPhoto = false);
    }
  }

  Future<void> _saveDisplayName() async {
    final newName = _displayNameController.text.trim();
    if (newName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Display name cannot be empty'),
          backgroundColor: AppTheme.priorityUrgent,
        ),
      );
      return;
    }

    setState(() => _isSavingName = true);
    try {
      await _supabase.auth.updateUser(
        UserAttributes(data: {'full_name': newName}),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Display name saved successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save display name: $e'),
            backgroundColor: AppTheme.priorityUrgent,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingName = false);
    }
  }

  Future<void> _handleSignOut() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surfaceContainerHighColor(context),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
          side: BorderSide(color: AppTheme.borderColor(context)),
        ),
        title: Text(
          'Sign Out?',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.text(context)),
        ),
        content: Text(
          'Are you sure you want to sign out of Waycord on this device?',
          style: TextStyle(fontSize: 13, color: AppTheme.textMuted(context)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: TextStyle(color: AppTheme.textMuted(context))),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.priorityUrgent,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            ),
            child: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isSigningOut = true);
    try {
      await _supabase.auth.signOut();
    } catch (e) {
      if (mounted) {
        setState(() => _isSigningOut = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sign out error: $e'),
            backgroundColor: AppTheme.priorityUrgent,
          ),
        );
      }
    }
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$label copied to clipboard')),
    );
  }

  void _showChangePasswordDialog() {
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool dialogLoading = false;
    bool obscurePassword = true;

    showDialog(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surfaceContainerHighColor(context),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
            side: BorderSide(color: AppTheme.borderColor(context)),
          ),
          title: Text(
            'Change Password',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppTheme.text(context),
            ),
          ),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Enter a new secure password (at least 6 characters).',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.textMuted(context),
                  ),
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: newPasswordController,
                  obscureText: obscurePassword,
                  style: TextStyle(fontSize: 13, color: AppTheme.text(context)),
                  decoration: InputDecoration(
                    labelText: 'New Password',
                    labelStyle: TextStyle(fontSize: 12, color: AppTheme.textMuted(context)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    filled: true,
                    fillColor: AppTheme.surfaceContainerLowestColor(context),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: BorderSide(color: AppTheme.borderColor(context)),
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                        size: 16,
                        color: AppTheme.textMuted(context),
                      ),
                      onPressed: () => setDialogState(() => obscurePassword = !obscurePassword),
                    ),
                  ),
                  validator: (v) => (v == null || v.trim().length < 6) ? 'Minimum 6 characters required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: confirmPasswordController,
                  obscureText: obscurePassword,
                  style: TextStyle(fontSize: 13, color: AppTheme.text(context)),
                  decoration: InputDecoration(
                    labelText: 'Confirm Password',
                    labelStyle: TextStyle(fontSize: 12, color: AppTheme.textMuted(context)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    filled: true,
                    fillColor: AppTheme.surfaceContainerLowestColor(context),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: BorderSide(color: AppTheme.borderColor(context)),
                    ),
                  ),
                  validator: (v) => v != newPasswordController.text ? 'Passwords do not match' : null,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: dialogLoading ? null : () => Navigator.pop(dialogCtx),
              child: Text('Cancel', style: TextStyle(color: AppTheme.textMuted(context))),
            ),
            ElevatedButton(
              onPressed: dialogLoading
                  ? null
                  : () async {
                      if (!formKey.currentState!.validate()) return;
                      final messenger = ScaffoldMessenger.of(context);
                      setDialogState(() => dialogLoading = true);
                      try {
                        await _supabase.auth.updateUser(
                          UserAttributes(password: newPasswordController.text.trim()),
                        );
                        if (dialogCtx.mounted) {
                          Navigator.pop(dialogCtx);
                        }
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Password updated successfully!')),
                        );
                      } catch (e) {
                        setDialogState(() => dialogLoading = false);
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text('Failed to update password: $e'),
                            backgroundColor: AppTheme.priorityUrgent,
                          ),
                        );
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.mint,
                foregroundColor: AppTheme.onMint,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
              ),
              child: dialogLoading
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.onMint),
                    )
                  : const Text('Update Password', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = _supabase.auth.currentUser;
    final email = user?.email ?? 'Unknown Email';
    final uid = user?.id ?? 'Unknown UID';
    final currentDisplayName = _displayNameController.text.trim();
    final effectiveName = currentDisplayName.isNotEmpty
        ? currentDisplayName
        : (user?.email?.split('@').first ?? 'User');

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 896),
        child: ListView(
          padding: const EdgeInsets.only(top: 16, bottom: 90),
          children: [
            // Header Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_back, size: 18, color: AppTheme.textMuted(context)),
                        onPressed: widget.onBackToToday,
                        tooltip: 'Back to Today',
                      ),
                      Text(
                        'IDENTITY & CREDENTIALS',
                        style: AppTheme.monoStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.mint,
                          letterSpacing: 1.0,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: Text('•', style: TextStyle(color: AppTheme.borderColor(context))),
                      ),
                      Text(
                        'Account Profile',
                        style: AppTheme.monoStyle(
                          fontSize: 11,
                          color: AppTheme.textMuted(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Account & Profile',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.text(context),
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Manage your personal credentials, workspace presence, and session state.',
                    style: TextStyle(fontSize: 12, color: AppTheme.textMuted(context)),
                  ),
                  const SizedBox(height: 14),
                  Divider(color: AppTheme.borderColor(context), height: 1),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Profile Card (Avatar + Photo Upload)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerColor(context),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.borderColor(context)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        UserAvatar(
                          fullName: effectiveName,
                          avatarUrl: _avatarUrl,
                          radius: 36,
                        ),
                        if (_isUploadingPhoto)
                          Positioned.fill(
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.black54,
                                shape: BoxShape.circle,
                              ),
                              child: const Center(
                                child: SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppTheme.mint,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            effectiveName,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.text(context),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            email,
                            style: AppTheme.monoStyle(
                              fontSize: 11,
                              color: AppTheme.textMuted(context),
                            ),
                          ),
                          const SizedBox(height: 10),
                          OutlinedButton.icon(
                            onPressed: (_isUploadingPhoto || _isSigningOut)
                                ? null
                                : _pickAndUploadPhoto,
                            icon: const Icon(Icons.camera_alt_outlined, size: 14),
                            label: Text(
                              _isUploadingPhoto ? 'Uploading...' : 'Upload / Change Photo',
                              style: const TextStyle(fontSize: 12),
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.text(context),
                              side: BorderSide(color: AppTheme.borderColor(context)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Identity & Details Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerColor(context),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.borderColor(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.badge_outlined, size: 18, color: AppTheme.mint),
                        const SizedBox(width: 8),
                        Text(
                          'Personal Information',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.text(context),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Display Name Field with Save Button
                    Text(
                      'DISPLAY NAME',
                      style: AppTheme.monoStyle(fontSize: 10.5, color: AppTheme.textMuted(context)),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _displayNameController,
                            style: TextStyle(fontSize: 13, color: AppTheme.text(context)),
                            decoration: InputDecoration(
                              isDense: true,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              filled: true,
                              fillColor: AppTheme.surfaceContainerLowestColor(context),
                              hintText: 'Enter your full name',
                              hintStyle: TextStyle(
                                fontSize: 12,
                                color: AppTheme.textMuted(context).withValues(alpha: 0.5),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(4),
                                borderSide: BorderSide(color: AppTheme.borderColor(context)),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(4),
                                borderSide: const BorderSide(color: AppTheme.mint),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        ElevatedButton.icon(
                          onPressed: (_isSavingName || _isSigningOut) ? null : _saveDisplayName,
                          icon: _isSavingName
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.onMint),
                                )
                              : const Icon(Icons.check, size: 14),
                          label: const Text(
                            'Save',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.mint,
                            foregroundColor: AppTheme.onMint,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),
                    Divider(color: AppTheme.borderColor(context), height: 1),
                    const SizedBox(height: 14),

                    // Email Address
                    Text(
                      'EMAIL ADDRESS',
                      style: AppTheme.monoStyle(fontSize: 10.5, color: AppTheme.textMuted(context)),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLowestColor(context),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.borderColor(context)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              email,
                              style: TextStyle(
                                fontSize: 13,
                                color: AppTheme.text(context),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.mint.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: Text(
                              'VERIFIED',
                              style: AppTheme.monoStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.mint,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Monospace Copyable UID
                    Text(
                      'USER IDENTIFIER (UID)',
                      style: AppTheme.monoStyle(fontSize: 10.5, color: AppTheme.textMuted(context)),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLowestColor(context),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.borderColor(context)),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: SelectableText(
                              uid,
                              style: AppTheme.monoStyle(
                                fontSize: 11.5,
                                color: AppTheme.textMuted(context),
                              ),
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.copy_rounded, size: 16, color: AppTheme.textMuted(context)),
                            onPressed: () => _copyToClipboard(uid, 'UID'),
                            tooltip: 'Copy UID',
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Security & Credentials Card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerColor(context),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.borderColor(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.lock_outline_rounded, size: 18, color: AppTheme.mint),
                        const SizedBox(width: 8),
                        Text(
                          'Security & Credentials',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.text(context),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Manage your account password for email/password authentication across Waycord platforms.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.textMuted(context),
                      ),
                    ),
                    const SizedBox(height: 14),
                    OutlinedButton.icon(
                      onPressed: _isSigningOut ? null : _showChangePasswordDialog,
                      icon: const Icon(Icons.key_rounded, size: 15),
                      label: const Text('Change Password', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.text(context),
                        side: BorderSide(color: AppTheme.borderColor(context)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Active Communities List Card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerColor(context),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.borderColor(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.hub_outlined, size: 18, color: AppTheme.mint),
                            const SizedBox(width: 8),
                            Text(
                              'Active Communities & Workspaces',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.text(context),
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: Icon(Icons.refresh_rounded, size: 16, color: AppTheme.textMuted(context)),
                          onPressed: () {
                            setState(() {
                              _communitiesFuture = _supabaseService.fetchUserCommunities();
                            });
                          },
                          tooltip: 'Refresh Communities',
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    FutureBuilder<List<Map<String, dynamic>>>(
                      future: _communitiesFuture,
                      builder: (context, snapshot) {
                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(24),
                              child: SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppTheme.mint,
                                ),
                              ),
                            ),
                          );
                        }

                        final communities = snapshot.data ?? [];
                        if (communities.isEmpty) {
                          return Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceContainerLowestColor(context),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: AppTheme.borderColor(context)),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.groups_outlined, size: 30, color: AppTheme.textMuted(context)),
                                const SizedBox(height: 8),
                                Text(
                                  'No active communities joined',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: AppTheme.text(context),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Join a workspace via invite code or create a new team hub.',
                                  style: AppTheme.monoStyle(
                                    fontSize: 11,
                                    color: AppTheme.textMuted(context),
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          );
                        }

                        return Column(
                          children: communities.map((comm) {
                            final id = comm['id']?.toString() ?? '';
                            final name = comm['name']?.toString() ?? 'Community';
                            final role = comm['role']?.toString().toUpperCase() ?? 'MEMBER';

                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              decoration: BoxDecoration(
                                color: AppTheme.surfaceContainerHighColor(context),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: AppTheme.borderColor(context)),
                              ),
                              child: ListTile(
                                dense: true,
                                onTap: () {
                                  context.read<NavigationProvider>().selectCommunity(id, name: name);
                                  widget.onBackToToday();
                                },
                                leading: Container(
                                  width: 30,
                                  height: 30,
                                  decoration: BoxDecoration(
                                    color: AppTheme.surfaceContainerColor(context),
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: AppTheme.borderColor(context)),
                                  ),
                                  child: const Icon(Icons.hub_outlined, size: 15, color: AppTheme.mint),
                                ),
                                title: Text(
                                  name,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.text(context),
                                  ),
                                ),
                                subtitle: Text(
                                  'Role: $role',
                                  style: AppTheme.monoStyle(
                                    fontSize: 10,
                                    color: AppTheme.textMuted(context),
                                  ),
                                ),
                                trailing: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.mint.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                  child: Text(
                                    role,
                                    style: AppTheme.monoStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.mint,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Feedback & Support Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerColor(context),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.borderColor(context)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppTheme.mint.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.chat_bubble_outline_rounded,
                          size: 18,
                          color: AppTheme.mint,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Support & Feedback',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.text(context),
                            ),
                          ),
                          Text(
                            'Share your thoughts, suggestions, or report issues.',
                            style: AppTheme.monoStyle(
                              fontSize: 10,
                              color: AppTheme.textMuted(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => showFeedbackDialog(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.mint,
                        foregroundColor: AppTheme.onMint,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                      child: const Text('Feedback', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Sign Out Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerColor(context),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.borderColor(context)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppTheme.priorityUrgent.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.logout_rounded,
                          size: 18,
                          color: AppTheme.priorityUrgent,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Session & Security',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.text(context),
                            ),
                          ),
                          Text(
                            'Sign out of your account on this device.',
                            style: AppTheme.monoStyle(
                              fontSize: 10.5,
                              color: AppTheme.textMuted(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: _isSigningOut ? null : _handleSignOut,
                      icon: _isSigningOut
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.logout_rounded, size: 14),
                      label: const Text(
                        'Sign Out',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.priorityUrgent.withValues(alpha: 0.2),
                        foregroundColor: AppTheme.priorityUrgent,
                        side: const BorderSide(color: AppTheme.priorityUrgent, width: 0.8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
