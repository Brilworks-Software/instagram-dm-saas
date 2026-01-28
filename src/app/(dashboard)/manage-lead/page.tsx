"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Lead = {
	id: string;
	igUsername: string;
	fullName: string;
	profilePicUrl?: string;
};

type LeadList = {
	id: string;
	name: string;
	description?: string;
	filterKeywords?: string[];
	autoAdd?: boolean;
	members: { lead: Lead }[];
};

export default function ManageLeadPage() {

	// User leads state for table (not from lists)
	const [userLeads, setUserLeads] = useState<Lead[]>([]);
	const [userLeadsTotal, setUserLeadsTotal] = useState(0);
	const [userLeadsPage, setUserLeadsPage] = useState(1);
	const [userLeadsPageSize, setUserLeadsPageSize] = useState(20);
	const [userLeadsSearch, setUserLeadsSearch] = useState("");

	const [tab, setTab] = useState<'leads' | 'lists'>('leads');
	const [lists, setLists] = useState<LeadList[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState("");
	const [editList, setEditList] = useState<LeadList | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [editListName, setEditListName] = useState("");
	const [editListDesc, setEditListDesc] = useState("");

	// Fetch user leads for table
	async function fetchUserLeads(page = userLeadsPage, pageSize = userLeadsPageSize, search = userLeadsSearch) {
		setLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams({
				page: String(page),
				pageSize: String(pageSize),
				search: search || "",
			});
			const res = await fetch(`/api/leads/user-list?${params}`);
			const data = await res.json();
			if (!data.success) throw new Error(data.error || "Failed to fetch user leads");
			setUserLeads(data.leads);
			setUserLeadsTotal(data.total);
			setUserLeadsPage(data.page);
			setUserLeadsPageSize(data.pageSize);
		} catch (e: any) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchLists();
	}, []);

	async function fetchLists() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/leads/lists");
			const data = await res.json();
			if (!data.success) throw new Error(data.error || "Failed to fetch");
			setLists(data.lists);
		} catch (e: any) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	// Fetch user leads on mount and when page/search changes
	useEffect(() => {
		fetchUserLeads();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userLeadsPage, userLeadsPageSize, userLeadsSearch]);

	// For member add, use userLeads instead of allLeads
	const allLeads: Lead[] = userLeads;


	// Edit List Modal logic
	function handleEditList(list: LeadList) {
		setEditList(list);
		setEditListName(list.name);
		setEditListDesc(list.description || "");
		setEditListMembers(list.members.map((m) => m.lead));
		setShowModal(true);
	}
	function handleCloseModal() {
		setEditList(null);
		setEditListMembers([]);
		setShowModal(false);
	}

	// State for editing members
	const [editListMembers, setEditListMembers] = useState<Lead[]>([]);
	const [addMemberUsername, setAddMemberUsername] = useState("");
	const [addMemberError, setAddMemberError] = useState<string | null>(null);


	// Only allow adding leads not already in the list
	function handleAddMember() {
		setAddMemberError(null);
		const username = addMemberUsername.trim().toLowerCase();
		if (!username) return;
		// Only consider leads not already in the list
		const availableLeads = allLeads.filter(
			(l) => !editListMembers.some((m) => m.id === l.id)
		);
		const found = availableLeads.find(
			(l) => l.igUsername.toLowerCase() === username
		);
		if (!found) {
			setAddMemberError("Lead not found or already in list");
			return;
		}
		setEditListMembers([...editListMembers, found]);
		setAddMemberUsername("");
	}

	function handleRemoveMember(leadId: string) {
		setEditListMembers(editListMembers.filter((m) => m.id !== leadId));
	}

	async function handleSaveEditList() {
		if (!editList) return;
		setLoading(true);
		setError(null);
		try {
			// Save name/desc and members
			const res = await fetch(`/api/leads/lists/${editList.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: editListName,
					description: editListDesc,
					memberIds: editListMembers.map((m) => m.id),
				}),
			});
			const data = await res.json();
			if (!data.success) throw new Error(data.error || "Failed to update");
			await fetchLists();
			setShowModal(false);
		} catch (e: any) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	async function handleDeleteList(listId: string) {
		if (!window.confirm("Delete this list?")) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/leads/lists/${listId}`, { method: "DELETE" });
			const data = await res.json();
			if (!data.success) throw new Error(data.error || "Failed to delete");
			await fetchLists();
		} catch (e: any) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	// TODO: Add create list

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Manage Leads</h1>
			<div className="mb-4 flex gap-2">
				<Button
					variant={tab === "leads" ? "primary" : "ghost"}
					onClick={() => setTab("leads")}
				>
					Leads
				</Button>
				<Button
					variant={tab === "lists" ? "primary" : "ghost"}
					onClick={() => setTab("lists")}
				>
					Manage Lists
				</Button>
			</div>

			{tab === "leads" && (
				<div>
					<div className="mb-2 flex items-center gap-2">
						<Input
							placeholder="Filter by username or name"
							value={filter}
							onChange={(e) => {
								setFilter(e.target.value);
								setUserLeadsSearch(e.target.value);
								setUserLeadsPage(1);
							}}
							className="w-64"
						/>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse rounded-xl bg-[var(--background-elevated)] shadow-md">
							<thead>
								<tr>
									<th className="py-3 px-4 text-left font-semibold text-[var(--foreground)] bg-[var(--background-tertiary)] border-b border-[var(--border)]">Profile</th>
									<th className="py-3 px-4 text-left font-semibold text-[var(--foreground)] bg-[var(--background-tertiary)] border-b border-[var(--border)]">Username</th>
									<th className="py-3 px-4 text-left font-semibold text-[var(--foreground)] bg-[var(--background-tertiary)] border-b border-[var(--border)]">Full Name</th>
								</tr>
							</thead>
							<tbody>
								{userLeads.map((lead) => (
									<tr key={lead.id} className="hover:bg-[var(--background-secondary)] transition">
										<td className="py-2 px-4">
											{lead.profilePicUrl ? (
												<img src={lead.profilePicUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-[var(--border)]" />
											) : (
												<span className="w-8 h-8 inline-block bg-gray-300 rounded-full" />
											)}
										</td>
										<td className="py-2 px-4 text-[var(--accent-color)] font-medium">{lead.igUsername}</td>
										<td className="py-2 px-4">{lead.fullName}</td>
									</tr>
								))}
								{userLeads.length === 0 && (
									<tr>
										<td colSpan={3} className="py-4 px-4 text-center text-[var(--foreground-muted)]">No leads found.</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{tab === "lists" && (
				<div>
					<div className="mb-2 flex justify-end">
						{/* Add List button can go here */}
					</div>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse rounded-xl bg-[var(--background-elevated)] shadow-md">
							<thead>
								<tr>
									<th className="py-3 px-4 text-left font-semibold text-[var(--foreground)] bg-[var(--background-tertiary)] border-b border-[var(--border)]">Name</th>
									<th className="py-3 px-4 text-left font-semibold text-[var(--foreground)] bg-[var(--background-tertiary)] border-b border-[var(--border)]">Description</th>
									<th className="py-3 px-4 text-left font-semibold text-[var(--foreground)] bg-[var(--background-tertiary)] border-b border-[var(--border)]"># Leads</th>
									<th className="py-3 px-4 text-left font-semibold text-[var(--foreground)] bg-[var(--background-tertiary)] border-b border-[var(--border)]">Actions</th>
								</tr>
							</thead>
							<tbody>
								{lists.map((list) => (
									<tr key={list.id} className="hover:bg-[var(--background-secondary)] transition">
										<td className="py-2 px-4 font-medium">{list.name}</td>
										<td className="py-2 px-4">{list.description}</td>
										<td className="py-2 px-4">{list.members.length}</td>
										<td className="py-2 px-4">
											<Button
												variant="ghost"
												className="mr-2"
												onClick={() => handleEditList(list)}
											>
												Edit
											</Button>
											<Button
												variant="danger"
												onClick={() => handleDeleteList(list.id)}
											>
												Delete
											</Button>
										</td>
									</tr>
								))}
								{lists.length === 0 && (
									<tr>
										<td colSpan={4} className="py-4 px-4 text-center text-[var(--foreground-muted)]">No lists found.</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}


			{/* Edit List Modal */}
			<Dialog open={showModal} onOpenChange={setShowModal} title="Edit List">
				<div className="space-y-2">
					<label className="block text-sm font-medium">Name</label>
					<Input
						value={editListName}
						onChange={(e) => setEditListName(e.target.value)}
						className="w-full"
					/>
					<label className="block text-sm font-medium">Description</label>
					<Input
						value={editListDesc}
						onChange={(e) => setEditListDesc(e.target.value)}
						className="w-full"
					/>
					<label className="block text-sm font-medium mt-2">Members</label>
					<div className="flex gap-2 mb-2">
						<Input
							placeholder="Add by username"
							value={addMemberUsername}
							onChange={(e) => setAddMemberUsername(e.target.value)}
							className="w-48"
							onKeyDown={(e) => { if (e.key === 'Enter') handleAddMember(); }}
						/>
						<Button onClick={handleAddMember}>Add</Button>
					</div>
					{addMemberError && <div className="text-red-600 text-xs mb-2">{addMemberError}</div>}
					<div className="max-h-40 overflow-y-auto border rounded p-2 bg-[var(--background-secondary)]">
						{editListMembers.length === 0 && <div className="text-[var(--foreground-muted)] text-sm">No members in this list.</div>}
						{editListMembers.map((lead) => (
							<div key={lead.id} className="flex items-center gap-2 py-1 border-b last:border-b-0">
								{lead.profilePicUrl ? (
									<img src={lead.profilePicUrl} alt="" className="w-6 h-6 rounded-full object-cover border" />
								) : (
									<span className="w-6 h-6 inline-block bg-gray-300 rounded-full" />
								)}
								<span className="font-medium">{lead.igUsername}</span>
								<span className="text-xs text-[var(--foreground-muted)]">{lead.fullName}</span>
								<Button variant="ghost" size="sm" onClick={() => handleRemoveMember(lead.id)}>Remove</Button>
							</div>
						))}
					</div>
					<div className="flex justify-end gap-2 pt-4">
						<Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
						<Button onClick={handleSaveEditList}>Save</Button>
					</div>
				</div>
			</Dialog>

			{loading && <div className="fixed top-0 left-0 w-full bg-blue-100 text-blue-800 p-2 text-center">Loading...</div>}
			{error && <div className="fixed top-0 left-0 w-full bg-red-100 text-red-800 p-2 text-center">{error}</div>}
		</div>
	);
}

